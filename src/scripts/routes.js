const mysql = require("mysql");
const express = require("express");
const app = express();

const connection = () => {
    console.log("Conexão com o banco realizada!");
    
    return mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234",
        database: "ufrrj_projeto"
    });
}

const formatDate = date => { 
    if(date == "") {
        return "";
    }
    
    const data = new Date(date);

    const fDate = `${data.getFullYear()}-${data.getMonth() < 9 ? "0" + (data.getMonth() + 1) : data.getMonth() + 1}-${data.getDate() < 10 ? "0" + data.getDate() : data.getDate()}`;
    
    return fDate;
} 

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// const map = (value, valueMin, valueMax, mapMin, mapMax) => {
//     let result;

//     if(value == null || isNaN(value)) {
//         return 0;
//     }

//     result = (((mapMax - mapMin) * (value - valueMin)) / (valueMax - valueMin)) + mapMin;

//     return result;
// }

// let query = [];

// for (let i = 0; i < 144 * 1; i ++) {
//     let t = (Math.random() * 10 + 10).toFixed(2);
//     let u = (Math.random() * 50 + 30).toFixed(2);
//     let c = (Math.random() * 50 + 30).toFixed(2);
//     // let l_e_unformatted = new Date().toLocaleString();
//     // let l_e = l_e_unformatted.split(' ');
//     // l_e[0] = l_e[0].split('/');
//     // [l_e[0][0], l_e[0][2]] = [l_e[0][2], l_e[0][0]]
//     // l_e[0] = l_e[0].join('-');
//     // l_e = l_e.join(' ');

//     query.push(`(${t}, ${u}, ${c}, "2021-05-22 ${parseInt(map(i, 0, 144, 0, 13))}:${parseInt(map(i, 0, 144, 10, 60))}:${parseInt(map(i, 0, 144, 10, 60))}")`);
// }

// query = query.join(', ');

// connection().query(`insert into leituras(temperatura, umidade, co2, lido_em) values ${query};`, (err, result) => {
//     if(err) {
//         console.log(err);
//     } else {
//         console.log("Leituras adicionadas ao banco de dados!");
//     }
// });

app.get('/mysql/leituras', (req, res) => {
    console.log("Headers: ", req.get('X-Date'));

    let date = formatDate(req.get('X-Date')).split('-');
        // mode = req.get('mode');

    let query = "select * from leituras";

    if(date[0]) {
        query += ` where lido_em between '${date[0]}-01-01 00:00:00' and '${date[0]}-12-31 23:59:59'`;
    } else {
        let defaultYear = new Date().getFullYear();

        query += ` where lido_em between '${defaultYear}-01-01 00:00:00' and '${defaultYear}-12-31 23:59:59'`;
    }

    console.log(query);

    connection().query(query, (err, result) => {
        if(err) {
            console.log(err);
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
});

app.post('/mysql/leituras', (req, res) => {
    if(Object.keys(req.body).length == 0) {
        res.status(400).json({status: 400, message: "Não é possível processar uma requisição vazia!"});

        return;
    } 

    let dados = {
        temperatura: req.body.temperatura ? req.body.temperatura.toFixed(2) : null,
        co2: req.body.co2 ? req.body.co2.toFixed(2) : null,
        umidade: req.body.umidade ? req.body.umidade.toFixed(2) : null,
        lido_em: req.body.lido_em || new Date()
    };

    connection().query(`insert into leituras set ?`, dados, (err, result) => {
        if(err) {
            console.log(err);
            res.status(500).json({status: 500, message: "Serviço Indisponível. Tente novamente mais tarde!"});
        } else {
            console.log('Uma nova leitura foi adicionada ao banco!');
            res.status(200).json({status: 200, message: "Leitura adicionada com sucesso!"});
        }
    });
});

app.get('/mysql/limites', (req, res) => {
    connection().query("select temperatura, umidade, co2 from limites limit 1", (err, result) => {
        if(err) {
            console.log(err);
            res.status(500).json(err);
        } else {
            for(let key in result[0]) {
                result[0][key] = JSON.parse(result[0][key]);
            }

            res.json(result[0]);
        }
    })
});

app.put('/mysql/limites', (req, res) => {
    if(Object.keys(req.body).length == 0) {
        res.status(400).json({status: 400, message: "Não é possível processar uma requisição vazia!"});

        return;
    }

    let limites = {};

    for(let key in req.body) {
        limites[key] = JSON.stringify(req.body[key]);
    }

    connection().query("select id from limites limit 1", (err, result) => {
        if(err) {
            console.log(err);
            res.status.json({status: 500, message: "Serviço Indisponível. Tente novamente mais tarde!"});
        } else {
            console.log('Novos limites foram setados!')
            connection().query(`update limites set ? where id = ${result[0].id}`, limites);
        }
    });
});

app.post('/mysql/erros', (req, res) => {
    // WIP - ENVIAR UMA NOTIFICAÇÃO PARA O FRONT

    connection().query("insert into erros set ?", req.body, (err, result) => {
        if(err) {
            console.log(err);
            res.status(500).json({status: 500, message: "Serviço Indisponível. Tente novamente mais tarde!"});
        } else {
            console.log('Um erro foi registrado!')
            res.json({status: 200, message: "Erro registrado com sucesso!"})
        }
    })
});


app.listen(3000, () => {
    console.log("Servidor ON:routes.js");
});

/*if(mode == "daily") {
    query += ` where lido_em between '${date[0]}-${date[1]}-${date[2]} 00:00:00' and '${date[0]}-${date[1]}-${date[2]} 23:59:59'`;
} else if(mode == "monthly") {
    query += ` where lido_em between '${date[0]}-${date[1]}-01 00:00:00'`;

    if(date[1] == 12) {
        query += ` and ${parseInt(date[0]) + 1}-01-01 00:00:00`;
    } else {
        query += ` and '${date[0]}-${parseInt(date[1]) + 1}-01 00:00:00'`;
    }
} else if(mode == "yearly") {
    query = ` where lido_em between '${date[0]}-01-01 00:00:00' and '${parseInt(date[0]) + 1}-01-01 00:00:00'`;
} else {
    // query += " limit 6";
    query += ` where lido_em between '${date[0]}-${date[1]}-${date[2]} 00:00:00' and '${date[0]}-${date[1]}-${date[2]} 23:59:59'`;
}*/