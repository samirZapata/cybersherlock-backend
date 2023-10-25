//ESTE ARCHIVO ESTABLECE ROLES PREDEFINIDOS PARA EL SISTEMA
import Role from "../models/Role";

export const createRoles = async () => {

    try{

        const count = await Role.estimatedDocumentCount(); //CONTADOR DE ROLES

        if (count > 0) return;
    
       const values = await Promise.all([ //CREA LOS ROLES
        new Role({ name: "user" }).save(),
        new Role({ name: "admin" }).save()
       ]); 
    
       console.log(values); 

    }catch(e){
        console.error(e);
    }

}