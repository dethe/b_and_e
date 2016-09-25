var brooms = {
    broomList: [
        {
            name: 'dusty broom',
            doesDamage: 8
        },
        {
            name: 'cobweb broom',
            doesDamage: 12
        },
        {
            name: 'hearth broom',
            doesDamage: 16
        },
        {
            name: 'kitchen broom',
            doesDamage: 20
        },
        {
            name: 'mountain broom',
            doesDamage: 24
        },
        {
            name: 'wicked broom',
            doesDamage: 28
        },
        {
            name: 'dragon broom',
            doesDamage: 32
        },
    ],
    nextBroom: function(broom){
        if (!broom){
            return this.broomList[0];
        }
        var idx = this.broomList.indexOf(broom) + 1;
        if (idx < this.broomList.length){
            broom = this.broomList[idx];
        }
        return broom;
    }
};

var bbqSymbol = '🌶';

var Character = function(x, y, name){
    Phaser.Sprite.call(this, game, x, y, name);
    this.state = game.state.states.Level;
};
Character.prototype = Object.create(Phaser.Sprite.prototype);
Character.prototype.constructor = Character;
Character.prototype.update = function(){
    // automatically called by World.update
    this.x += this.velocity.x * game.time.physicsElapsed;
};

var Player = function(x, y, name){
    Character.call(this, x, y, name);
    this.name = 'Nessarose';
    this.health = this.maxHealth;
    this.velocity = {x: 300, y: 0};
    this._anim = this.animations.add('walk');
    this._anim.play(10, true);
    this.anchor.setTo(0.5, 1);
    //the camera will follow the player in the world
    game.camera.follow(this);
    // combat settings
    this.broom = null;
    this.coins = 0;
    this.instaBBQs = 0;
    this.busTickets = 0;
    this.weapons = [
        {
            name: 'nap',
            range: 30,
            damage: 0,
            cooldown: 300,
            knockback: 0,
            selfdamage: -this.maxHealth,
        },
        {
            name: 'punch',
            range: 60,
            damage: 3,
            cooldown: 20,
            knockback: 20,
            selfdamage: 0,
        },
        {
            name: 'kick',
            range: 120,
            damage: 5,
            cooldown: 60,
            knockback: 60,
            selfdamage: 2,
        },
        {
            name: 'broom',
            range: 240,
            damage: 10,
            cooldown: 30,
            knockback: 10,
            selfdamage: 0,
        },
        {
            name: 'throw insta-bbq',
            range: 600,
            damage: 150,
            cooldown: 20,
            knockback: 120,
            selfdamage: 0,
        },
    ]
};
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function(){
    Character.prototype.update.call(this);
};
Player.prototype.look = function(){
    // Open doors, examine wall
};
Player.prototype.move = function(){
};
Player.prototype.attack = function(){
    if (this.isCoolingDown){
        // cooldown should be based on time elapsed, like movement
        this.isCoolingDown -= 1;
        if (!this.isCoolingDown){
            this.state.playerActionText.text = '';
            this.state.isNapping = false;
        }
        return;
    }
    if (!this.state.monster){ return; }
    if (!this.state.keys.space.isDown){ return; }
    var monsterToTheLeft = this.state.monster.x < this.x;
    if (monsterToTheLeft && this.scale.x === -1){
        // OK we're facing the monster
    }else if(!monsterToTheLeft && this.scale.x === 1){
        // OK, we're facing the monster
    }else{
        // console.log('Nessarose is facing the wrong way!');
        return;
    }
    var distance = Math.abs(this.state.monster.x - this.x);
    var weapon = null;
    for (var i = 0; i < this.weapons.length; i++){
        var w = this.weapons[i];
        if (w.name === 'nap' && this.state.monster.name !== 'Umber Couch'){ continue; }
        if (w.name === 'broom' && !this.broom){ continue; }
        if (w.name === 'throw insta-bbq' && !this.instaBBQs){ continue; }
        if (distance < w.range){
            weapon = w;
            break;
        }
    }
    if (weapon){
        this.state.monster.knockback(weapon.knockback);
        this.state.monster.damage(weapon.damage);
        this.health -= weapon.selfdamage;
        // is the following line needed or is it part of framework?
        if (this.health > this.maxHealth){ this.health = this.maxHealth; }
        if (weapon.name === 'throw insta-bbq'){
            this.instaBBQs--;
        }
        if (weapon.name === 'nap'){
            this.isNapping = true;
        }
        this.state.playerActionText.text = 'Nessarose ' + weapon.name;
        this.isCoolingDown = weapon.cooldown;
    }
};
Player.prototype.loot = function(item, number){
    switch(item){
        case 'coin':
            this.coins += number;
            break;
        case 'lost thing':
            // get a random one of remaining lost things
            // maybe win game?
            break;
        case 'bunion ointment':
            // kick gets stronger
            // kick self-damage gets less
            break;
        case 'insta-bbq':
            self.instaBBQs += number;
            break;
        case 'broom':
            self.broom = brooms.nextBroom(self.broom);
            // upgrade our broom
            for (var i = 0; i < self.weapons.length; i++){
                if (self.weapons[i].name === 'broom'){
                    self.weapons[i].damage = self.broom.damage;
                }
            }
            break;
        case 'bus ticket':
            self.busTickets += 1;
            break;
        default:
            console.error('we should not get here');
            break;
    }
};

var Monster = function(x, y, name, info){
    Character.call(this, x, y, name);
    this.anchor.setTo(0.5, 1);
    Phaser.Utils.extend(this, info);
    this.maxHealth = info.health;
    this.isCoolingDown = 0;
    this.velocity = {x: -info.speed, y: 0}
    this.kill(true);
};
Monster.prototype = Object.create(Character.prototype);
Monster.prototype.constructor = Monster;
Monster.prototype.update = function(){
    Character.prototype.update.call(this);
};
Monster.prototype.knockback = function(distance){
    this.x -= (distance + this.scale.x);
    // would be nice to effect the speed/momentum too...
};
Monster.prototype.move = function(){
    //   game.physics.arcade.collide(this.monster, this.blockedLayer);
    var fuzz = 20; // we don't need this to be too specific
    var distance = Math.abs(this.state.player.x - this.x);
    if (distance < this.range - fuzz){
        this.moveAway();
    }else if(distance > this.range + fuzz){
        this.moveCloser();
    }else{
        this.velocity.x = 0;
    }
};
Monster.prototype.moveAway = function(){
    var playerToTheLeft = this.state.player.x < this.x;
    if (playerToTheLeft){
        this.velocity.x = this.speed;
    }else{
        this.velocity.x = -this.speed ;
    }
};
Monster.prototype.moveCloser = function(){
    var playerToTheLeft = this.state.player.x < this.x;
    if (playerToTheLeft){
        this.velocity.x = -this.speed;
    }else{
        this.velocity.x = this.speed;
    }
};
Monster.prototype.attack = function(){
    var playerToTheLeft = this.state.player.x < this.x;
    if (playerToTheLeft){
        this.scale.x = 1;
    }else{
        this.scale.x = -1;
    }
    if (this.isCoolingDown){
        // cooldown should be based on time elapsed, like movement
        this.isCoolingDown -= 1;
        if (!this.isCoolingDown){
            this.state.monsterActionText.text = '';
        }
        return;
    }
    var fuzz = 20; // we don't need this to be too specific
    var distance = Math.abs(this.state.player.x - this.x);
    if ((distance + fuzz) > this.range && (distance - fuzz) < this.range){
        var attackRoll = this.state.rnd.between(0, 99);
        if (attackRoll < this.hitson){
            this.state.player.damage(this.doesDamage);
            this.isCoolingDown = this.cooldown;
            this.state.monsterActionText.text = 'The ' + this.name +
              ' ' + this.attackText + '.';
        }else{
            this.state.monsterActionText.text = 'The ' + this.name +
              ' swung at you, but missed.'
        }
    }
};
Monster.prototype.kill = function(firstTime){
    Character.prototype.kill.call(this);
    if (!firstTime){
        for (var i=0; i < this.loot.length; i++){
            var item = this.loot[i];
            if (game.rnd.integerInRange(0, 99) < item.chance){
                this.state.player.loot(item.name, game.rnd.integerInRange(1, item.upTo));
            }
        }
        this.state.monsterHealthBar.clearSprite();
    }
    this.state.monster = null;
};
Monster.prototype.restore = function(){
    this.revive();
    this.health = this.maxHealth;
    this.x = this.state.player.x + 200;
    this.state.monster = this;
    this.state.monsterHealthBar.setSprite(this);
    return this;
};
