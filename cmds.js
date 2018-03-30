const {models} = require('./model');
const Sequelize = require('sequelize');
const {log, biglog, errorlog, colorize} = require("./out");

exports.helpCmd = (socket, rl) =>{
	log(socket, "Comandos");
	log(socket, " h|help - Muestra esta yuda.");
	log(socket, " list - lista los quizes existentes.");
	log(socket, " show <id> - Muestra la pregunta y su respuesta en el quiz");
	log(socket, " add - Añadir nuevo quiz.");
	log(socket, " delete <id> - Borra el quiz indicado");
	log(socket, " edit <id> - Edita el quiz indicado");
	log(socket, " test <id> - Prueba el quiz indicado");
	log(socket, " p|play - Jugar con preguntas aleatorias de todos los quizes");
	log(socket, " credits - Créditos");
	log(socket, " q|quit - Salir del programa");
	rl.prompt();
};

exports.quitCmd = (socket, rl) =>{
	rl.close();
	socket.end();
};

const makeQuestion= (rl, text)=>{

	return new Sequelize.Promise ((resolve , reject)=>{
		rl.question(colorize(text, 'red'), answer=>{
			resolve(answer.trim());
		});
	});
};



exports.addCmd = (socket, rl) =>{
	makeQuestion(socket,rl, 'Introduzca una pregunta:')
	.then(q=> {
			return makeQuestion(socket,rl, 'Introduzca la respuesta')
			.then(a =>{
				return{question: q, answer: a};
			});
	})
	.then(quiz=> {
		return models.quiz.create(quiz);
	})
	.then((quiz)=>{
		log(socket,`${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error=>{
		errorlog(socket,'El quiz es erroneo:');
		error.errors.forEach(({message})=> errorlog(socket, message));
	})
	.catch(error =>{
		errorlog(socket, error.message);
	})
	.then(()=>{
		rl.prompt();
	});
};



exports.listCmd = (socket, rl) =>{
	models.quiz.findAll()
	.each(quiz =>{
			log(socket,` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} `);
	})
	.catch(error =>{
		errorlog(socket,error.message);
	})
	.then(()=>{
		rl.prompt();
	});
};


const validateId= (id) =>{

	return new Sequelize.Promise((resolve, reject)=>{
		if (typeof id == "undefined"){
			reject(new Error('Falta el parametro <id>.'));
		}else{
			id = parseInt(id);
			if (Number.isNaN(id)){
				reject(new Error (`El valor del parametro <id> no es un numero.`));
			}else{
				resolve(id);
			}
		}
	});
};



exports.showCmd = (socket, rl, id) => {
	
	validateId(id)
	.then(id=> models.quiz.findById(id))
	.then(quiz =>{
		if(!quiz){
			throw new Error (`No existe un quiz asociado al id=${id}.`);
		}
		log(socket,` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error =>{
		errorlog(socket,error.message);
	})
	.then(()=>{
		rl.prompt();
	});
};
exports.testCmd = (socket, rl,id) =>{
	validateId(id)
	.then(id=> models.quiz.findById(id))
	.then(quiz =>{
		if(!quiz){
			throw new Error (`No existe un quiz asociado al id=${id}.`);
		}
		makeQuestion(rl,quiz.question)
		.then(answer=> {
					if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
							biglog(socket,' Correcto', 'green');
							log(socket,'Su respuesta es correcta.');
							rl.prompt();
					}else{
							log(socket,'Su respuesta es incorrecta.');
							biglog(socket,' Incorrecto', 'red');
							rl.prompt();
						}
				});
	})
	.catch(error =>{
		errorlog(socket, error.message);
	})
	.then(()=>{
		rl.prompt();
	});
};

/*exports.testCmd = (rl,id) =>{
	if (typeof id === "undefined"){
		errorlog(`El valor del parámetro id no es válido.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);
			rl.question(`${quiz.question}: `, answer =>{
				if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
					log('Su respuesta es correcta.');
					biglog(' Correcta', 'green');
					rl.prompt();
				}
				else{
					log('Su respuesta es incorrecta.');
					biglog(' Incorrecta', 'red');
					rl.prompt();
				}	
			});
			rl.prompt();
		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};*/
exports.deleteCmd = (socket, rl,id) =>{
	validateId(id)
	.then(id=> models.quiz.destroy({where: {id}}))
	.catch(error=> {
		errorlog(socket,error.message);
	})
	.then(()=>{
		rl.prompt();
		});
	};
	function numeroAleatorio(min, max) {
 			 return Math.round(Math.random() * (max - min) + min);
			};
/*exports.playCmd = rl => {
	pendientes = [];
	let long= model.count();
	for (i =0; i<model.count(); i++) {
		pendientes.push(i);
	}
	function numeroAleatorio(min, max) {
 			 return Math.round(Math.random() * (max - min) + min);
			}
	const askrandom = () => {

		if (pendientes.length===0){
			log("Fin");
			log(`Ha obtenido una puntuación de: ${colorize(score, 'green')} sobre ${colorize(long, 'green')}`);
			biglog(`${score}`, 'magenta');
			rl.prompt();
		}else{
					let randi = numeroAleatorio(0,pendientes.length-1);
					let id = pendientes[randi];
					pendientes.splice(randi,1);
			
				try{
					const quiz=model.getByIndex(id);
					rl.question(`${quiz.question}: `, answer =>{
						if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
							biglog(' Correcto', 'green');
							log('Su respuesta es correcta.');
							score++;
							log(`Ha obtenido una puntuación de: ${colorize(score, 'green')} hasta ahora`);
							biglog(`${score}`, 'magenta');
							askrandom();
						}else{
							log('Su respuesta es incorrecta.');
							biglog(' Incorrecto', 'red');
							log("Fin");
							log(`Ha obtenido una puntuación de: ${colorize(score, 'green')} sobre ${colorize(long, 'green')}`);
							biglog(`${score}`, 'magenta');
							rl.prompt();
							}	
						});

				}catch(error){
					errorlog(error.message);
					rl.prompt();
				}
		}
	}
	askrandom();
};*/
exports.playCmd = (socket, rl) => {
	primero=1;
	let score = 0;
	pendientes = [];
	models.quiz.findAll({raw:true})
	.then(quizzes=>{
			return new Sequelize.Promise((resolve, reject)=>{
				pendientes=quizzes;
				resolve();
				return;
			});
		})
	.then(()=>{
		return askrandom();
	})
	.catch(Sequelize.ValidationError, error =>{
		errorlog(socket,'El quiz es incorrecto: ');
		error.errors.forEach(({message})=> errorlog(socket,message));
	})
	.catch(error=>{
		errorlog(socket,error.message);
	})
	.then(()=>{
		rl.prompt();
	});

	const askrandom = ()=>{
		
			return new Promise((resolve, reject)=>{
				
				if (pendientes.length>0 ){
					primero=0;
				let randi = numeroAleatorio(0,pendientes.length-1);
				let quiz = pendientes[randi];
				pendientes.splice(randi,1);
				makeQuestion(rl,quiz.question)
				.then(answer=> {
					if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
							biglog(socket,' Correcto', 'green');
							log(socket,'Su respuesta es correcta.');
							score++;
							log(socket,`Ha obtenido una puntuación de: ${colorize(score, 'green')} hasta ahora`);
							biglog(socket,`${score}`, 'magenta');
							resolve(askrandom());
					}else{
							log(socket,'Su respuesta es incorrecta.');
							biglog(socket,' Incorrecto', 'red');
							log(socket,"Fin");
							log(socket,`Ha obtenido una puntuación de: ${colorize(score, 'green')} `);
							biglog(socket,`${score}`, 'magenta');
							resolve();
							rl.prompt();
						}
				});

				}else{
					if(primero){rl.prompt();}
					else{log(socket,"Fin");
					log(socket,`Ha obtenido una puntuación de: ${colorize(score, 'green')} `);
					biglog(socket,`${score}`, 'magenta');
					rl.prompt();}
				}
			
		});
		
	}
	askrandom();
};


exports.editCmd = (socket, rl,id) =>{
	validateId(id)
	.then(id=> models.quiz.findById(id))
	.then(quiz=>{
		if(!quiz){
			throw new Error (`No existe un quiz asociado al id=${id}.`);
		}
		process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.question)},0);
		return makeQuestion(rl, 'Introduzca la pregunta')
		.then(q=>{
			process.stdout.isTTY && setTimeout(()=>{rl.write(quiz.answer)},0);
			return makeQuestion(rl, 'Introduzca la respuesta')
			.then(a=>{
				quiz.question=q;
				quiz.answer=a;
				return quiz
			});
		});	
	})
	.then(quiz=>{
		return quiz.save();
	})
	then(quiz=>{
		log(socket,`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer} `);
	})
	.catch(Sequelize.ValidationError, error =>{
		errorlog(socket,'El quiz es erroneo:');
		error.errors.forEach(({message})=> errorlog(socket,message));
	})
	.catch(error =>{
		errorlog(socket,error.message);
	})
	.then(()=>{
		rl.prompt();
	});
};


exports.creditsCmd =(socket, rl) =>{
	log(socket,'Autor de la practica');
	log(socket,'Miguel Angel Lopez Muñoz');
	rl.prompt();
};
