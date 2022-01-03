import fs from 'fs'
import Config from './config.js'

class Dossier {
    createFolder(path) {
        return fs.promises.mkdir(`${Config.dossierRoot}/${path}`,{recursive:true})
        .then(() => {
            return path
        })
        .catch(error => {
            console.log('Error creating folder: ', error.message)
        })
    }


    writeFile(folder,filename,buffer) {
        return fs.promises.writeFile(`${Config.dossierRoot}/${folder}/${filename}`,buffer)
        .catch(error => {
            console.log('Error writing file: ', error.message)
        })
    }
}

export default Dossier