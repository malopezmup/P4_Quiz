//preguntas
const Sequelize = require('sequelize');
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});

sequelize.define('quiz', {
	question: {
		type: Sequelize.STRING,
		unique: {msg: "Ya existe esta pregunta"},
		validate:{notEmpty: {msg: "La respuesta no puede estar vacía"}}
	},
	answer: {
		type: Sequelize.STRING,
		validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
	}

});

sequelize.sync()
.then(()=> sequelize.models.quiz.count())
.then(count=> {
	if (!count) {
		return sequelize.models.quiz.bulkCreate([
			{question: "Capital de España", answer: "Madrid"},
			{question: "Capital de Italia", answer: "Roma"},
			{question: "Capital de Noruega", answer: "Oslo"},
			{question: "Capital de Suecia", answer: "Estocolmo"}
		]);
	}
})
.catch(error => {
	console.log(error);
});

module.exports = sequelize;