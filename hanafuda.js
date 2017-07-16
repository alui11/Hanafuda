// Set the configuration for your app
// TODO: Replace with your project's config object
var config = {
	apiKey: "AIzaSyCilkiS4yB8QIiiZsysfU9VkKN8caiws28",
	authDomain: "hanafuda-9e7bb", 
	databaseURL: "https://hanafuda-9e7bb.firebaseio.com/"
};
firebase.initializeApp(config);
var player_num = 1;

// Get a reference to the database service
var database = firebase.database();
function player(){
	this.hand = [];
	this.captured = {
		animals: [],
		brights: [],
		normals: [],
		ribbons: []
	};

	this.score = 0;
	this.total_score = 0;
}

function Card(m, t, i){
	this.month = m;
	this.type = t;
	this.id = i;
}

function Deck(){
	this.state = {
		topCard : 0,
		cards : [
			new Card(1, "normal", "jan1"),
			new Card(1, "normal", "jan2"),
			new Card(1, "ribbon", "redwords1"),
			new Card(1, "bright", "crane"),
			new Card(2, "normal", "feb1"),
			new Card(2, "normal", "feb2"),
			new Card(2, "ribbon", "redwords2"),
			new Card(2, "animal", "nightingale"),
			new Card(3, "normal", "mar1"),
			new Card(3, "normal", "mar2"),
			new Card(3, "ribbon", "redwords3"),
			new Card(3, "bright", "curtain"),
			new Card(4, "normal", "apr1"),
			new Card(4, "normal", "apr2"),
			new Card(4, "ribbon", "red4"),
			new Card(4, "animal", "cuckoo"),
			new Card(5, "normal", "may1"),
			new Card(5, "normal", "may2"),
			new Card(5, "ribbon", "red5"),
			new Card(5, "animal", "bridge"),
			new Card(6, "normal", "jun1"),
			new Card(6, "normal", "jun2"),
			new Card(6, "ribbon", "blue1"),
			new Card(6, "animal", "butterflies"),
			new Card(7, "normal", "jul1"),
			new Card(7, "normal", "jul2"),
			new Card(7, "ribbon", "red7"),
			new Card(7, "animal", "boar"),
			new Card(8, "normal", "aug1"),
			new Card(8, "normal", "aug2"),
			new Card(8, "animal", "geese"),
			new Card(8, "bright", "moon"),
			new Card(9, "normal", "sep1"),
			new Card(9, "normal", "sep2"),
			new Card(9, "ribbon", "blue2"),
			new Card(9, "animal", "sakecup"),
			new Card(10, "normal", "oct1"),
			new Card(10, "normal", "oct2"),
			new Card(10, "ribbon", "blue3"),
			new Card(10, "animal", "deer"),
			new Card(11, "normal", "lightning"),
			new Card(11, "ribbon", "red11"),
			new Card(11, "animal", "swallow"),
			new Card(11, "bright", "rainman"),
			new Card(12, "normal", "dec1"),
			new Card(12, "normal", "dec2"),
			new Card(12, "normal", "dec3"),
			new Card(12, "bright", "phoenix")
				]
	}
	this.shuffle = function(){
		var currentIndex = this.state.cards.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = this.state.cards[currentIndex];
			this.state.cards[currentIndex] = this.state.cards[randomIndex];
			this.state.cards[randomIndex] = temporaryValue;
		}
	}
	this.deal = function(){
		this.state.topCard++;
		return this.state.cards[this.state.topCard-1];
	}
}

var game = 
{
	player1 : new player(),
	player2 : new player(),
	table : [],
	deck : new Deck(),
	koikoi: 0,
	turn: 1,
	init: function(){
		this.player1.hand = [];
		this.player2.hand = [];
		this.player1.score = 0;
		this.player2.score = 0;
		this.player1.captured = {
			animals: [],
			brights: [],
			normals: [],
			ribbons: []
		};
		this.player2.captured = {
			animals: [],
			brights: [],
			normals: [],
			ribbons: []
		};
		this.table = [];
		this.deck.state.topCard = 0;
		this.deck.shuffle();
		for(var i=0;i<8;i++){
			this.player1.hand.push(this.deck.deal());
			this.player2.hand.push(this.deck.deal());
			this.table.push(this.deck.deal());
		}
		this.turn = 1;
	},
	play: function(player, cardPlayed, secondCall){
		var countMatches = 0;
		var match1, match2, match3;
		var match_index1, match_index2;
		//remove card played from player's hand
		var index = player.hand.indexOf(cardPlayed);
		var match2case = false;
		if(index>-1) player.hand.splice(index, 1);
		//find matches on the table
		for(var i=0;i<this.table.length;i++){
			if(this.table[i].month == cardPlayed.month){
				countMatches++;
				switch(countMatches){
					case 1:
						match1 = this.table[i];
						match_index1 = i;
						break;
					case 2:
						match2 = this.table[i];
						match_index2 = i;
						break;
					case 3:
						match3 = this.table[i];
						break;
				}
			}
		}
		switch(countMatches){
			case 0:
				this.table.push(cardPlayed);
				break;
			case 2:
				match2case = true;
				$("#message_text").html(
					"<img src=\"./images/" + match1.id + ".png\"/>\n<img src=\"./images/" + match2.id + ".png\"/><br>一致が二つあります。どちらがいいですか？");
				$( function() {
					$( "#dialog-confirm" ).dialog({
						title: "選んでください",
						resizable: false,
						height: "auto",
						width: 400,
						modal: true,
						buttons: {
							"左": function() {
								game["player"+player_num].captured[cardPlayed.type+'s'].push(cardPlayed);
								game["player"+player_num].captured[match1.type+'s'].push(match1);
								game.table.splice(match_index1, 1);
								console.log(game.table);
								console.log(index);
								if(!secondCall){
									game.play(player, game.deck.deal(), true);
								}else{
									game.play_part2(player);
								}
								update_db();
								$( this ).dialog( "close" );
							},
							"右": function() {
								game["player"+player_num].captured[cardPlayed.type+'s'].push(cardPlayed);
								game["player"+player_num].captured[match2.type+'s'].push(match2);
								game.table.splice(match_index2, 1);
								if(!secondCall){
									game.play(player, game.deck.deal(), true);
								}else{
									game.play_part2(player);
								}
								update_db();
								$( this ).dialog( "close" );
							}
						}
					});
				} );
				break;
			case 1:
				player.captured[cardPlayed.type + 's'].push(cardPlayed);
				player.captured[match1.type + 's'].push(match1);
				var index = this.table.indexOf(match1);
				if(index>-1) this.table.splice(index, 1);
				break;
			//case 2:
				//call another function
				//break;
			case 3:
				player.captured[cardPlayed.type + 's'].push(cardPlayed);
				player.captured[match1.type + 's'].push(match1);
				player.captured[match2.type + 's'].push(match2);
				player.captured[match3.type + 's'].push(match3);
				var index = this.table.indexOf(match1);
				if(index>-1) this.table.splice(index, 1);
				index = this.table.indexOf(match2);
				if(index>-1) this.table.splice(index, 1);
				index = this.table.indexOf(match3);
				if(index>-1) this.table.splice(index, 1);
				break;
		}
		if(!match2case){
			if(!secondCall){
				this.play(player, this.deck.deal(), true);
			}else{
				this.play_part2(player);
			}
		}
	},
	play_part2: function(player){
		if(this.score_evaluate(player)>0){
			update_db();
			$("#message_text").html("こいこい？");
			$( function() {
				$( "#dialog-confirm" ).dialog({
					title: player.score + "文！",
					resizable: false,
					height: "auto",
					width: 400,
					modal: true,
					buttons: {
						"こいこい": function() {
							game.koikoi = player_num;
							game.turn = game.turn===1? 2 : 1;
							if(game.player1.hand.length == 0 && game.player2.hand.length == 0){
								game.init();
							}
							update_db();
							$( this ).dialog( "close" );
						},
						"終わり": function() {
							
							player.total_score += player.score;
							game["player"+player_num].total_score = player.total_score;
							console.log(game.player1.total_score);
							console.log(game.player2.total_score);
							game.init();
							game.turn = player_num;
							update_db();
							update_screen();
							console.log("here");
							$( this ).dialog( "close" );
						}
					}
				});
			} );
		}else{
			game.turn = game.turn===1? 2 : 1;
			if(this.player1.hand.length == 0 && this.player2.hand.length == 0){
				game.init();
				update_db();
			}
			update_db();
		}
	},
	score_evaluate: function(player){
		var score = 0;
		var hasSakeCup = false;
		//brights
		var hasRainman = false, hasMoon = false, hasCurtain = false;
		var nBrights = player.captured.brights.length;
		for(var i=0;i<nBrights;i++){
			if(player.captured.brights[i].id == "rainman") hasRainman = true;
			if(player.captured.brights[i].id == "moon") hasMoon = true;
			if(player.captured.brights[i].id == "curtain") hasCurtain = true;
		}
		if(nBrights == 3 && !hasRainman) score += 6;
		if(nBrights == 4 && !hasRainman) score += 8;
		if(nBrights == 4 && hasRainman) score += 7;
		if(nBrights == 5) score += 15;
		//5 animals + 1 for each extra
		var nAnimals = player.captured.animals.length; 
		if(nAnimals >= 5) score += nAnimals - 4;
		//boar, deer, and butterfly
		var boarDeerButter = 0;
		for(var i=0; i<nAnimals; i++){
			if(player.captured.animals[i].id == "boar" || player.captured.animals[i].id == "deer" || player.captured.animals[i].id == "butterflies")
				boarDeerButter++;
			if(player.captured.animals[i].id == "sakecup")
				hasSakeCup = true;
		}
		if(boarDeerButter == 3) score += 5;
		//10 normal + 1 each extra (count sake cup)
		var nNormals = player.captured.normals.length;
		if(hasSakeCup) nNormals++;
		if(nNormals >= 10) score += nNormals - 9;
		//5 ribbons +1 each extra
		var nRibbons = player.captured.ribbons.length;
		if(nRibbons >= 5) score += nRibbons - 4;
		//3 red poetry ribbons / 3 blue ribbons
		var poetryRibbon = 0, blueRibbon = 0;
		for(var i=0; i<nRibbons; i++){
			if(player.captured.ribbons[i].id == "redwords1" || player.captured.ribbons[i].id == "redwords2" || player.captured.ribbons[i].id == "redwords3")
				poetryRibbon++;
			if(player.captured.ribbons[i].id == "blue1" || player.captured.ribbons[i].id == "blue2" || player.captured.ribbons[i].id == "blue3")
				blueRibbon++;
		}
		if(poetryRibbon == 3) score += 5;
		if(blueRibbon == 3) score += 5;
		//sake cup + moon/curtain
		if(hasSakeCup && hasMoon) score += 5;
		if(hasSakeCup && hasCurtain) score += 5;
		if(score > player.score){
			console.log("OMGGG:");
			console.log(this.koikoi);
			if((this.koikoi==1 && player==this.player2) || (this.koikoi==2 && player==this.player1)){
				score *= 2;
				console.log("Score Doubled");
			}
			player.score = score;
			return score;
		}
		return 0;
	}

}
//game.init();
function initer(){
	game.init();
	game.player1.total_score = 0;
	game.player2.total_score = 0;
	update_db();
}

function update_db(){
	console.log(game.turn);
	console.log(game.player1);
	console.log(game.player2);
	var stuff = {player1: game.player1, player2: game.player2, table: game.table, deck: game.deck.state, koikoi: game.koikoi, turn: game.turn};
	database.ref().set(JSON.stringify(stuff));
	console.log(game.player1);
	console.log(game.player2);
	console.log(game.table);
}

function update_screen(){
	//update table
	$("#table").empty();
	for(var i=0; i<game.table.length; i++){
		var card = $("<img class=\"match" + i + "\" src=\"./images/" + game.table[i].id + ".png\">");
		$("#table").append(card);
	}
	//update hand
	$("#hand").empty();
	if(player_num === 1){
		for(var i=0; i<game.player1.hand.length; i++){
			var card = $("<img class=\"clickable1\" src=\"./images/" + game.player1.hand[i].id + ".png\">");
			let t = game.player1.hand[i];
			card.mouseover(function(){
				if(game.turn !== player_num){
					return;
				}
				$(".clickable1").attr("class", "clickable");
			});
			card.click(function(){
				console.log(game.turn);
				console.log(player_num);
				if(game.turn !== player_num){
					return;
				}
				game.play(game.player1, t);
				update_db();
			});
			$("#hand").append(card);
		}
	}else{
		for(var i=0; i<game.player2.hand.length; i++){
			var card = $("<img class=\"clickable2\" src=\"./images/" + game.player2.hand[i].id + ".png\">");
			let t = game.player2.hand[i];
			card.mouseover(function(){
				if(game.turn !== player_num){
					return;
				}
				$(".clickable2").attr("class", "clickable");
			});
			card.click(function(){
				if(game.turn !== player_num){
					return;
				}
				game.play(game.player2, t);
				update_db();
			});
			$("#hand").append(card);
		}
	}
	//update captured
	$("#mynormals").empty();
	$("#myanimals").empty();
	$("#myribbons").empty();
	$("#mybrights").empty();
	$("#yournormals").empty();
	$("#youranimals").empty();
	$("#yourribbons").empty();
	$("#yourbrights").empty();

	for(var i=0; i<game.player1.captured.normals.length; i++){
		var card = $("<img src=\"./images/" + game.player1.captured.normals[i].id + ".png\">");
		card.attr("style", "height: 68px ; width: 42px");
		player_num===1 ? $("#mynormals").append(card) : $("#yournormals").append(card);
	}
	for(var i=0; i<game.player1.captured.animals.length; i++){
		var card = $("<img src=\"./images/" + game.player1.captured.animals[i].id + ".png\">");
		card.attr("style", "height: 68px ; width: 42px");
		player_num===1? $("#myanimals").append(card) : $("#youranimals").append(card);
	}
	for(var i=0; i<game.player1.captured.ribbons.length; i++){
		var card = $("<img src=\"./images/" + game.player1.captured.ribbons[i].id + ".png\">");
		card.attr("style", "height: 68px ; width: 42px");
		player_num===1? $("#myribbons").append(card) : $("#yourribbons").append(card);
	}
	for(var i=0; i<game.player1.captured.brights.length; i++){
		var card = $("<img src=\"./images/" + game.player1.captured.brights[i].id + ".png\">");
		card.attr("style", "height: 68px ; width: 42px");
		player_num===1? $("#mybrights").append(card) : $("#yourbrights").append(card);
	}
	for(var i=0; i<game.player2.captured.normals.length; i++){
		var card = $("<img src=\"./images/" + game.player2.captured.normals[i].id + ".png\">");
		card.attr("style", "height: 68px ; width: 42px");
		player_num===2? $("#mynormals").append(card) : $("#yournormals").append(card);
	}
	for(var i=0; i<game.player2.captured.animals.length; i++){
		var card = $("<img src=\"./images/" + game.player2.captured.animals[i].id + ".png\">");
		card.attr("style", "height: 68px ; width: 42px");
		player_num===2? $("#myanimals").append(card) : $("#youranimals").append(card);
	}
	for(var i=0; i<game.player2.captured.ribbons.length; i++){
		var card = $("<img src=\"./images/" + game.player2.captured.ribbons[i].id + ".png\">");
		card.attr("style", "height: 68px ; width: 42px");
		player_num===2? $("#myribbons").append(card) : $("#yourribbons").append(card);
	}
	for(var i=0; i<game.player2.captured.brights.length; i++){
		var card = $("<img src=\"./images/" + game.player2.captured.brights[i].id + ".png\">");
		card.attr("style", "height: 68px ; width: 42px");
		player_num===2? $("#mybrights").append(card) : $("#yourbrights").append(card);
	}
	//update score
	if(player_num===1){
		$("#totalscores").html("私：" + game.player1.total_score + "文　　　　他のプレーヤー：" + game.player2.total_score + "文");
	}else{
		$("#totalscores").html("私：" + game.player2.total_score + "文　　　　他のプレーヤー：" + game.player1.total_score + "文");
	}
	//update turn
	if(game.turn===1){
		$("b").html("１");
	}else{
		$("b").html("２");
	}
}

var stuff = {player1: game.player1, player2: game.player2, table: game.table, deck: game.deck.state, koikoi: game.koikoi, turn: game.turn};
database.ref().set(JSON.stringify(stuff));
console.log(stuff)
database.ref().on('value', function(snapshot) {
	console.log(game.player1);
	console.log(game.player2);
	var data = JSON.parse(snapshot.val());
	game.player1 = data.player1;
	game.player2 = data.player2;
	game.table = data.table;
	game.deck.state = data.deck;
	game.koikoi = data.koikoi;
	game.turn = data.turn;
	console.log(game.player1);
	console.log(game.player2);
	console.log(data);
	update_screen();
});


