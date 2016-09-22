
var Character = function(game, x, y, key){
    Phaser.Sprite.call(this, game, x, y, key);
    this.state = this.game.state.states.Level;
};
Character.prototype = Object.create(Phaser.Sprite.prototype);
Character.prototype.constructor = Character;
Character.prototype.update = function(){
    // automatically called by World.update
    this.x += this.data.velocity.x * this.game.time.physicsElapsed;
};

var Player = function(game, x, y, key){
    Character.call(this, game, x, y, key);
    this.health = this.maxHealth;
    this.data.velocity = {x: 300, y: 0};
    this._anim = this.animations.add('walk');
    this._anim.play(10, true);
    this.anchor.setTo(0.5, 1);
    //the camera will follow the player in the world
    this.game.camera.follow(this);
    // combat settings
    this.has_broom = false;
    this.number_of_instabbq = 0;
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
    if (this.data.isCoolingDown){
        // cooldown should be based on time elapsed, like movement
        this.data.isCoolingDown -= 1;
        if (!this.data.isCoolingDown){
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
        console.log('Nessarose is facing the wrong way!');
        return;
    }
    var distance = Math.abs(this.state.monster.x - this.x);
    var weapon = null;
    for (var i = 0; i < this.weapons.length; i++){
        var w = this.weapons[i];
        if (w.name === 'nap' && this.state.monster.name !== 'Umber Couch'){ continue; }
        if (w.name === 'broom' && !this.has_broom){ continue; }
        if (w.name === 'throw insta-bbq' && !this.number_of_instabbq){ continue; }
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
            this.number_of_instabbq--;
        }
        if (weapon.name === 'nap'){
            this.isNapping = true;
        }
        this.state.playerActionText.text = 'Nessarose ' + weapon.name;
        this.data.isCoolingDown = weapon.cooldown;
    }
};
var Monster = function(game, x, y, key){
    Character.call(this, game, x, y, key);
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
    //   this.game.physics.arcade.collide(this.monster, this.blockedLayer);
    var fuzz = 20; // we don't need this to be too specific
    var distance = Math.abs(this.state.player.x - this.x);
    if (distance < this.data.range - fuzz){
        this.moveAway();
    }else if(distance > this.data.range + fuzz){
        this.moveCloser();
    }else{
        this.data.velocity.x = 0;
    }
};
Monster.prototype.moveAway = function(){
    var playerToTheLeft = this.state.player.x < this.x;
    if (playerToTheLeft){
        this.data.velocity.x = this.data.speed;
    }else{
        this.data.velocity.x = -this.data.speed ;
    }
};
Monster.prototype.moveCloser = function(){
    var playerToTheLeft = this.state.player.x < this.x;
    if (playerToTheLeft){
        this.data.velocity.x = -this.data.speed;
    }else{
        this.data.velocity.x = this.data.speed;
    }
};
Monster.prototype.attack = function(){
    var playerToTheLeft = this.state.player.x < this.x;
    if (playerToTheLeft){
        this.scale.x = 1;
    }else{
        this.scale.x = -1;
    }
    if (this.data.isCoolingDown){
        // cooldown should be based on time elapsed, like movement
        this.data.isCoolingDown -= 1;
        if (!this.data.isCoolingDown){
            this.state.monsterActionText.text = '';
        }
        return;
    }
    var fuzz = 20; // we don't need this to be too specific
    var distance = Math.abs(this.state.player.x - this.x);
    if ((distance + fuzz) > this.data.range && (distance - fuzz) < this.data.range){
        var attack_roll = this.state.rnd.between(0, 99);
        if (attack_roll < this.data.hitson){
            this.state.player.damage(this.data.doesDamage);
            this.data.isCoolingDown = this.data.cooldown;
            this.state.monsterActionText.text = 'The ' + this.name +
              ' ' + this.data.attackText + '.';
        }else{
            this.state.monsterActionText.text = 'The ' + this.name +
              ' swung at you, but missed.'
        }
    }
};
Monster.prototype.kill = function(){
    Character.prototype.kill.call(this);
    this.state.monster = null;
};


var SideScroller = SideScroller || {};
SideScroller.Level = function(){};
SideScroller.Level.prototype = {
  preload: function() {
      this.game.time.advancedTiming = true;
    },
  create: function() {
    this.map = this.game.add.tilemap('level1');
    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('dungeon', 'gameTiles');
    //create layers
    this.backgroundLayer1 = this.map.createLayer('Background 1');
    this.backgroundLayer2 = this.map.createLayer('Background 2');
    this.blockedLayer = this.map.createLayer('Blocking');
    //collision on blockedLayer
    // this.map.setCollisionBetween(1, 100000, true, 'Blocking');
    //resizes the game world to match the layer dimensions
    this.backgroundLayer1.resizeWorld();
    //create player
    this.player = this.game.add.existing(new Player(this.game, 35, 350, 'player'));
    //move player with cursor keys
    this.setupKeys();
    // set up torch sprite and animation
    // load torches
    this.createTorches();
    this.initWanderingMonsters();
    this.monster = null;
    // setup health and text
    this.initText();
  },
  setupKeys: function(){
      var player = this.player;
      this.game.input.keyboard.enabled = true;
      this.keys = this.game.input.keyboard.addKeys({
          a: Phaser.KeyCode.A,
          b: Phaser.KeyCode.B, // insta-bbq
          c: Phaser.KeyCode.C, // curse
          k: Phaser.KeyCode.K, // kick
          n: Phaser.KeyCode.N, // nap
          s: Phaser.KeyCode.S, // sweep
          t: Phaser.KeyCode.T, // ticket (for bus)
          up: Phaser.KeyCode.UP, // up arrow
          down: Phaser.KeyCode.DOWN, // down arrow
          right: Phaser.KeyCode.RIGHT, // right arrow
          left: Phaser.KeyCode.LEFT, // left arrow
          space: Phaser.KeyCode.SPACEBAR, // repeat last action, or kick
      });
      this.keys.right.action = function(){
          player.scale.x = 1;
          player.data.velocity.x = 300;
      };
      this.keys.left.action = function(){
          player.scale.x = -1;
          player.data.velocity.x = -300;
      };
      this.keys.up.action = function(){
          player.look();
      };
  },
  handleKeys: function(){
      var lastKey = this.game.input.keyboard.lastKey;
      if (lastKey && lastKey.isDown && lastKey.action){
          lastKey.action();
      }else{
          if (this.keys.right.isDown){ this.keys.right.action(); }
          if (this.keys.left.isDown){ this.keys.left.action(); }
      }
  },
  update: function() {
    // collision
    // this.game.physics.arcade.collide(this.player, this.blockedLayer);
    if (this.player.alive){
        this.player.data.velocity.x = 0;
        this.player.attack();
        this.handleKeys();
        if (!this.monster && this.underTorch()){
            this.addWanderingMonster();
        }
        if (this.monster){
            this.monster.move();
            this.monster.attack();
        }
    }
    //restart the game if reaching the edge
    if(this.player.x >= this.game.world.width || this.player.x < 0) {
        this.game.state.start('Level');
    }
    // show health bars
    this.showHealth();
  },
  render: function(){
        this.game.debug.text(this.game.time.fps || '--', 10, 20, "#00ff00", "14px Courier");
    },
  playerHit: function(player, blockedLayer) {

  },
  playerSweepBounds: function(){
      var b = this.player.getBounds();
      return new Phaser.Rectangle(b.x, 0, b.width, this.game.world.height);
  },
  underTorch: function(){
      var bounds = this.playerSweepBounds();
      for (var i = 0; i < this.torches.length; i++){
          if (bounds.intersects(this.torches.getAt(i).getBounds())){
              return true;
          }
      }
      return false;
  },
  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layerName) {
      var result = new Array();
      map.objects[layerName].forEach(function(element){
        if(element.type === type) {
          //Phaser uses top left, Tiled bottom left so we have to adjust
          //also keep in mind that some images could be of different size as the tile size
          //so they might not be placed in the exact position as in Tiled
          element.y -= map.tileHeight;
          result.push(element);
        }
      });
      return result;
    },
    //create a sprite from an object
    createFromTiledObject: function(element, group) {
        var torch = group.create(element.x, element.y, 'torch_sheet');
        // add animation to torch
        var torch_anim = torch.animations.add('flicker');
        torch_anim.play(10, true);
    },

    //create torches
    createTorches: function() {
        this.torches = this.game.add.group();
        this.torches.enableBody = true;
        var result = this.findObjectsByType('torch', this.map, 'Objects');
        result.forEach(function(element){
          this.createFromTiledObject(element, this.torches);
        }, this);
    },

    showCharHealth: function(sprite, bar){
        var relativeHealth = sprite.health / sprite.maxHealth;
        bar.context.fillStyle = '#000';
        bar.context.fillRect(0,0, 128, 8);
        var health_colour = '#00ff00';
        if (relativeHealth < .25){
            health_colour = '#ff0000';
        }else if (relativeHealth < .5){
            health_color = '#ffff00';
        }
        bar.context.fillStyle = health_colour;
        bar.context.fillRect(0,0, 128 * relativeHealth, 8);
        bar.dirty = true;

    },

    showHealth: function(){
        this.showCharHealth(this.player, this.player_health_bar);
        if (this.monster){
            this.monster_name_text.setText(this.monster.name);
            this.showCharHealth(this.monster, this.monster_health_bar);
        }else{
            this.monster_health_bar.context.clearRect(0,0,128,8);
            this.monster_health_bar.dirty = true;
            this.monster_name_text.setText('');
        }
    },

    _wanderingMonster: function(sprite_name, name, health, damage, hitson, cooldown, range, attackText, speed){
        var sprite = this.game.add.existing(new Monster(this.game, 0, 350, sprite_name));
        // this.game.physics.arcade.enable(sprite);
        sprite.anchor.setTo(0.5, 1);
        sprite.name = name;
        sprite.health = sprite.maxHealth = health;
        sprite.data.doesDamage = damage;
        sprite.data.hitson = hitson; // percent
        sprite.data.cooldown = cooldown;
        sprite.data.isCoolingDown = 0;
        sprite.data.range = range;
        sprite.data.attackText = attackText;
        sprite.data.speed = speed;
        sprite.data.velocity = {x: -speed, y: 0}
        sprite.kill();
        return sprite;
    },

    initText: function(){
        this.player_health_bar = this.add.bitmapData(128, 8);
        var phb = this.game.add.sprite(40, 60, this.player_health_bar);
        var pht = this.game.add.text(40, 30, 'Nessarose', '20pt Helvetica');
        phb.fixedToCamera = true;
        pht.fixedToCamera = true;
        this.monster_health_bar = this.add.bitmapData(128, 8);
        var mhb = this.game.add.sprite(this.game.camera.width - 168, 60, this.monster_health_bar);
        this.monster_name_text = this.game.add.text(this.game.camera.width - 168, 30, '', '20pt Helvetica');
        mhb.fixedToCamera = true;
        this.monster_name_text.fixedToCamera = true;
        this.monsterActionText = this.game.add.text(0, 0, '', '12pt Helvetica');
        this.monsterActionText.setTextBounds(173, 90, 400, 30);
        this.monsterActionText.boundsAlignH = 'center';
        this.monsterActionText.fixedToCamera = true;
        this.playerActionText = this.game.add.text(0,0, '', '12pt Helvetica');
        this.playerActionText.setTextBounds(173, 120, 400, 30);
        this.playerActionText.boundsAlignH = 'center';
        this.playerActionText.fixedToCamera = true;
    },

    initWanderingMonsters: function(){
        this.monsters = {
            umber_couch: this.wanderingUmberCouch(),
            hand_flayer: this.wanderingHandFlayer(),
            bearicorn: this.wanderingBearicorn(),
            ochre_cube: this.wanderingOchreCube(),
            owlpig: this.wanderingOwlpig(),
            globlin: this.wanderingGloblin(),
        };
    },

    wanderingUmberCouch: function(){
        return this._wanderingMonster('umber_couch', 'Umber Couch', 200, 4, 60, 30, 105, "butts its upholstery against you", 50);
    },

    wanderingHandFlayer: function(){
        return this._wanderingMonster('hand_flayer', 'Hand Flayer', 25, 6, 80, 60, 70, 'slaps you with its slimy hand-tentacles', 100);
    },

    wanderingBearicorn: function(){
        return this._wanderingMonster('bearicorn', 'Bearicorn', 150, 8, 65, 60, 70, 'gores you with its sparkly horn', 95);
    },

    wanderingOchreCube: function(){
        return this._wanderingMonster('ochre_cube', 'Ochre Cube', 50, 1, 90, 0, -35, 'leaves permanent turmeric stains on your clothing', 25);
    },

    wanderingOwlpig: function(){
        return this._wanderingMonster('owlpig', 'Owlpig', 100, 6, 50, 60, 70, 'pecks visciously at you with its snout', 110);
    },

    wanderingGloblin: function(){
        return this._wanderingMonster('globlin', 'Globlin', 10, 2, 80, 120, 250, 'throws a globule of itself at you', 125);
    },

    addWanderingMonster: function(){
        var choice = this.game.rnd.between(0, 62);
        var monster = null;
        if (choice < 1){
            monster = this.monsters.umber_couch;
        }else if (choice < 3){
            monster = this.monsters.hand_flayer;
        }else if (choice < 7){
            monster = this.monsters.bearicorn;
        }else if (choice < 15){
            monster = this.monsters.ochre_cube;
        }else if (choice < 31){
            monster = this.monsters.owlpig;
        }else{
            monster = this.monsters.globlin;
        }
        monster.revive();
        monster.health = monster.maxHealth;
        monster.x = this.player.x + 200;
        this.monster = monster;
        return monster;
    },
  };
