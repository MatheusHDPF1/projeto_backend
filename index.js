const express = require("express");

const cors = require("express");

const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const cfn = require("./config");

const url =  "mongodb+srv://matheus:matheus123@clusterclientes.lej2l.mongodb.net/segundaapi?retryWrites=true&w=majority";

mongoose.connect(url, {useNewUrlParser:true, useUnifiedTopology:true});

const tabela = mongoose.Schema({
    nome:{type:String, required:true},
    email:{type:String, required:true, unique:true},
    usuario:{type:String, required:true,unique:true },
    senha:{type:String, required:true,unique:true },
});

const tabelaagenda = mongoose.Schema({
    idpaciente:{type:String, required:true},
    nomemedico:{type:String, required:true},
    horario:{type:String},
    dia:{type:String},
});

tabela.pre("save", function(next){
    let paciente = this;
    if(!paciente.isModified('senha')) return next()
    bcrypt.hash(paciente.senha,10,(erro,rs)=>{
        if(erro) return console.log(`erro ao gerar senha->${erro}`);
        paciente.senha = rs;
        return next();
    })
   }
)


const Agenda = mongoose.model("tbagenda",tabelaagenda);
 
const Paciente = mongoose.model("tbpaciente",tabela);

const app = express();

app.use(express.json());
app.use(cors())

app.get("/api/paciente/",(req,res)=>{
    Paciente.find((erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar ler os Pacientes -> ${erro}`});
        }
        res.status(200).send({output:dados});
    }

    );
});

app.get("/api/agenda/",(req,res)=>{
    Agenda.find((erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar ler os Agendamentos -> ${erro}`});
        }
        res.status(200).send({output:dados});
    }
  );
});



app.get("/api/paciente/:id",(req,res)=>{
    Paciente.findById(req.params.id,(erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar ler os Clientes -> ${erro}`});
        }
        res.status(200).send({output:dados});
    }

    );
});

app.get("/api/agenda/:id",(req,res)=>{
    Agenda.findById(req.params.id,(erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar ler os agendamentos -> ${erro}`});
        }
        res.status(200).send({output:dados});
    }

    );
});



app.post("/api/paciente/cadastro",(req,res)=>{

    const paciente = new Paciente(req.body);
    paciente.save().then(()=>{
    //const gerado = criaToken(req.body.usuario,req.body.nome);
     res.status(201).send({output:`Paciente cadastrado`,});
    })
    .catch((erro)=>res.status(400).send({output:`Erro ao tentar cadastrar o cliente`,message:erro}))
});

app.post("/api/agenda/cadastro",(req,res)=>{

    const agenda = new Agenda(req.body);
    agenda.save().then(()=>{
    //const gerado = criaToken(req.body.usuario,req.body.nome);
     res.status(201).send({output:`Agenda realizada`,});
    })
    .catch((erro)=>res.status(400).send({output:`Erro ao tentar realizar o agendamento`,message:erro}))
});

app.post("/api/paciente/login",(req,res)=>{
    const us = req.body.usuario;
    const sh = req.body.senha;
    Paciente.findOne({usuario:us},(erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Usuario não localizado ${erro}`});
        }
        bcrypt.compare(sh,dados.senha,(erro,igual)=>{
            if(erro) return res.status(400).send({output:`Erro ao tentar logar->${erro}`});
            if(!igual) return res.status(400).send({output:`Senha inválida->${erro}`});
            //const gerado = criaToken(dados.usuario,dados.nome);
            res.status(200).send({output:`Logado`,payload:dados});
        })
       
    })
});

app.delete("/api/paciente/apagar/:id",(req,res)=>{
    Paciente.findByIdAndDelete(req.params.id,(erro,dados)=>{
        if(erro){
            return res.status(400).send({output:`Erro ao tentar apagar o Paciente->${erro}`});
        }
        res.status(204).send({});
    })
});

app.listen(3000,()=>console.log("Servidor online em http://localhost:3000"));



