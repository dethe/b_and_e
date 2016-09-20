
var Character = function(game, x, y, key){
    Phaser.Sprite.call(this, game, x, y, key);
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
};
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function(){
    Character.prototype.update.call(this);
};
Player.prototype.look = function(){
    // Open doors, examine wall
};

var Monster = function(game, x, y, key){
    Character.call(this, game, x, y, key);
};
Monster.prototype = Object.create(Character.prototype);
Monster.prototype.constructor = Monster;
Monster.prototype.update = function(){
    Character.prototype.update.call(this);
};


var SideScroller = SideScroller || {};
SideScroller.Game = function(){};
SideScroller.Game.prototype = {
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
      }
  },
  update: function() {
    // collision
    // this.game.physics.arcade.collide(this.player, this.blockedLayer);
    if (this.player.alive){
        this.player.data.velocity.x = 0;
        this.handleKeys();
        if (!this.monster && this.underTorch()){
            this.addWanderingMonster();
        }
        if (this.monster){
            this.monsterMove();
            this.monsterAttack();
        }
    }
    //restart the game if reaching the edge
    if(this.player.x >= this.game.world.width || this.player.x < 0) {
        this.game.state.start('Game');
    }
    // show health bars
    this.showHealth();
  },
  monsterMove: function(){
    //   this.game.physics.arcade.collide(this.monster, this.blockedLayer);
      var fuzz = 20; // we don't need this to be too specific
      var distance = Math.abs(this.player.x - this.monster.x) - (this.player.width + this.monster.width) / 2;
      if (distance < this.monster.data.range - fuzz){
          this._monsterMoveAway();
      }else if(distance > this.monster.data.range + fuzz){
          this._monsterMoveCloser();
      }else{
          this.monster.data.velocity.x = 0;
      }
  },
  _monsterMoveAway: function(){
      var playerToTheLeft = this.player.x < this.monster.x;
      if (playerToTheLeft){
          this.monster.data.velocity.x = this.monster.speed || 350;
      }else{
          this.monster.data.velocity.x = -(this.monster.speed || 350);
      }
  },
  _monsterMoveCloser: function(){
      var playerToTheLeft = this.player.x < this.monster.x;
      if (playerToTheLeft){
          this.monster.data.velocity.x = -(this.monster.speed || 350);
      }else{
          this.monster.data.velocity.x = this.monster.speed || 350;
      }
  },
  monsterAttack: function(){
      var playerToTheLeft = this.player.x < this.monster.x;
      if (playerToTheLeft){
          this.monster.scale.x = 1;
      }else{
          this.monster.scale.x = -1;
      }
      if (this.monster.data.isCoolingDown){
          this.monster.data.isCoolingDown -= 1;
          return;
      }
      var fuzz = 20; // we don't need this to be too specific
      var distance = Math.abs(this.player.x - this.monster.x) - (this.player.width + this.monster.width) / 2;
      if ((distance + fuzz) > this.monster.data.range && (distance - fuzz) < this.monster.data.range){
          var attack_roll = this.rnd.between(0, 99);
          if (attack_roll < this.monster.data.hitson){
              this.player.damage(this.monster.data.doesDamage);
              this.monster.data.isCoolingDown = this.monster.data.cooldown;
              this.damageText.text = 'The ' + this.monster.name +
                ' ' + this.monster.data.attackText + '.';
          }else{
              this.damageText.text = 'The ' + this.monster.name +
                ' swung at you, but missed.'
          }
      }
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

    _wanderingMonster: function(sprite_name, name, health, damage, hitson, cooldown, range, attackText){
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
        sprite.data.velocity = {x: -300, y: 0}
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
        this.damageText = this.game.add.text(0, 0, '', '16pt Helvetica');
        this.damageText.setTextBounds(173, 90, 400, 30);
        this.damageText.boundsAlignH = 'center';
        this.damageText.fixedToCamera = true;
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
        return this._wanderingMonster('umber_couch', 'Umber Couch', 200, 4, 60, 30, 105, "butts its upholstery against you");
    },

    wanderingHandFlayer: function(){
        return this._wanderingMonster('hand_flayer', 'Hand Flayer', 25, 6, 80, 60, 70, 'slaps you with its slimy hand-tentacles');
    },

    wanderingBearicorn: function(){
        return this._wanderingMonster('bearicorn', 'Bearicorn', 150, 8, 65, 60, 70, 'gores you with its sparkly horn');
    },

    wanderingOchreCube: function(){
        return this._wanderingMonster('ochre_cube', 'Ochre Cube', 50, 1, 90, 0, -35, 'leaves permanent turmeric stains on your clothing');
    },

    wanderingOwlpig: function(){
        return this._wanderingMonster('owlpig', 'Owlpig', 100, 6, 50, 60, 70, 'pecks visciously at you with its snout');
    },

    wanderingGloblin: function(){
        return this._wanderingMonster('globlin', 'Globlin', 10, 2, 80, 120, 250, 'throws a globule of itself at you');
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
