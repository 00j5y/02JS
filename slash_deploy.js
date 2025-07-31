const { REST, Routes} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const folder_path = path.join(__dirname, "commands");
const command_folders = fs.readdirSync(folder_path);

console.log("\n⌛ Début du chargement des commandes et des events\n");

for (const folder of command_folders){
    const commands_path = path.join(folder_path, folder);
    const command_files = fs.readdirSync(commands_path).filter(file => file.endsWith(".js"));

    console.log (`\n⚙️ Chargement des commandes présentes dans ${folder}`)

    for(const file of command_files){
        const file_path = path.join(commands_path, file);
        const command = require(file_path);

        if ("data" in command && "execute" in command){
            commands.push(command.data.toJSON())
            console.log(`✅ ${file} a été chargée`)
        }else{
            console.log(`Soit l'attribut \"data\" ou l'attribut \"commands\" est manquant dans le fichier ${command}`);
        }}
}

const rest = new REST({ version: '10', makeRequest: fetch }).setToken(process.env.token);

// On déploie les commandes

(async () => {
    try {
        const data = await rest.put(
            Routes.applicationCommands(process.env.clientID),
            {body: commands}
        );

        if (data.length === 0){
            console.log(`❌ Aucune commande n'a été chargée lors du lancement du bot`);
        } else {
            if(data.length === 1){
                console.log(`\n✅ Fin du chargement des commandes et des events\n✅ ${data.length} commande a été chargée`);
            }else{
                console.log(`\n✅ Fin du chargement des commandes et des events\n✅ ${data.length} commandes ont été chargées`);
            }
        }
    }catch(err){
        console.error(err);
    }
})();