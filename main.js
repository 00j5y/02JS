const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder, MessageFlags } = require('discord.js');
require('./slash_deploy'); // Déploiement des commandes
require('dotenv').config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	]
});

// Chargement des commandes
client.commands = new Collection();
const folder_path = path.join(__dirname, 'commands');
const command_folders = fs.readdirSync(folder_path);

for (const folder of command_folders) {
	const commands_path = path.join(folder_path, folder);
	const command_files = fs.readdirSync(commands_path).filter(file => file.endsWith('.js'));

	for (const file of command_files) {
		const file_path = path.join(commands_path, file);
		const command = require(file_path);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`Soit l'attribut "data" ou "execute" est manquant dans le fichier ${file_path}`);
		}
	}
}

// Chargement des events
const events_path = path.join(__dirname, 'events');
const events_files = fs.readdirSync(events_path).filter(file => file.endsWith('.js'));

for (const file of events_files) {
	const filePath = path.join(events_path, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client, ...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	console.log(`✅ Événement chargé : ${event.name}`);
}

// Gestion des interactions
client.on(Events.InteractionCreate, async (interaction) => {
	// Gestion des boutons
	if (interaction.isButton()) {
		for (const command of client.commands.values()) {
			if (typeof command.handleButton === 'function') {
				try {
					await command.handleButton(interaction);
				} catch (error) {
					console.error(error);
				}
			}
		}
	}


	// Gestion des erreurs
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	const ErreurRetour = new EmbedBuilder()
		.setColor(0xff0000)
		.addFields({ name: "\u00A0", value: "❌ Une erreur est survenue lors de l'exécution de la commande" });

	if (!command) {
		console.error(`❌ La commande "${interaction.commandName}" n'a pas été trouvée`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(`❌ Une erreur est survenue : ${err}`);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ embeds: [ErreurRetour], flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ embeds: [ErreurRetour], flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(process.env.token);
