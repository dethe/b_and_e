'use strict';

var SideScroller = SideScroller || {};
SideScroller.Level = function(){};
SideScroller.Level.prototype = {
  preload: function() {
      game.time.advancedTiming = true;
    },
  create: function() {
    this.map = game.add.tilemap('level1');
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
    this.player = game.add.existing(new Player(35, 350, 'player'));
    console.log(this.player);
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
      game.input.keyboard.enabled = true;
      this.keys = game.input.keyboard.addKeys({
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
          player.velocity.x = 300;
      };
      this.keys.left.action = function(){
          player.scale.x = -1;
          player.velocity.x = -300;
      };
      this.keys.up.action = function(){
          player.look();
      };
  },
  handleKeys: function(){
      var lastKey = game.input.keyboard.lastKey;
      if (lastKey && lastKey.isDown && lastKey.action){
          lastKey.action();
      }else{
          if (this.keys.right.isDown){ this.keys.right.action(); }
          if (this.keys.left.isDown){ this.keys.left.action(); }
      }
  },
  update: function() {
    // collision
    // game.physics.arcade.collide(this.player, this.blockedLayer);
    if (this.player.alive){
        this.player.velocity.x = 0;
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
    if(this.player.x >= game.world.width || this.player.x < 0) {
        game.state.start('Level');
    }
    // show health bars
    this.playerHealthBar.update();
    this.monsterHealthBar.update();
  },
  render: function(){
        game.debug.text(game.time.fps || '--', 10, 20, "#00ff00", "14px Courier");
    },
  playerHit: function(player, blockedLayer) {

  },
  playerSweepBounds: function(){
      var b = this.player.getBounds();
      return new Phaser.Rectangle(b.x, 0, b.width, game.world.height);
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
      var result = [];
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
        var torchAnim = torch.animations.add('flicker');
        torchAnim.play(10, true);
    },

    //create torches
    createTorches: function() {
        this.torches = game.add.group();
        this.torches.enableBody = true;
        var result = this.findObjectsByType('torch', this.map, 'Objects');
        result.forEach(function(element){
          this.createFromTiledObject(element, this.torches);
        }, this);
    },

    addHealthBar: function(x,y,w,h,sprite){
        var bar = this.add.bitmapData(w,h);
        var hb = game.add.sprite(x, y, bar);
        hb.fixedToCamera = true;
        var text = game.add.text(x, y-30, '', '20pt Helvetica');
        text.fixedToCamera = true;
        if (sprite){
            text.setText(sprite.name);
        }
        function update(){
            if (this.sprite){
                var relativeHealth = this.sprite.health / this.sprite.maxHealth;
                bar.context.fillStyle = '#000';
                bar.context.fillRect(0,0, 128, 8);
                var health_colour = '#00ff00';
                if (relativeHealth < .25){
                    health_colour = '#ff0000';
                }else if (relativeHealth < .5){
                    health_colour = '#ffff00';
                }
                bar.context.fillStyle = health_colour;
                bar.context.fillRect(0,0, 128 * relativeHealth, 8);
                bar.dirty = true;
            }
        }
        function clearSprite(){
            text.setText('');
            this.sprite = null;
            bar.context.clearRect(0,0,128,8);
            bar.dirty = true;
            text.setText('');
        }
        function setSprite(sprite){
            text.setText(sprite.name);
            this.sprite = sprite;
            this.update();
        }
        return {
            update: update,
            clearSprite: clearSprite,
            setSprite: setSprite,
            sprite: sprite,
        }
    },

    addText: function(x, y, w, h, align, text){
        var text = game.add.text(0, 0, text, '12pt Helvetica');
        text.setTextBounds(x, y, w, h);
        text.boundsAlignH = align;
        text.fixedToCamera = true;
        return text;
    },

    initText: function(){
        this.playerHealthBar = this.addHealthBar(40, 60, 128, 8, this.player);
        this.monsterHealthBar = this.addHealthBar(game.camera.width - 168, 60, 128, 8);
        this.monsterActionText = this.addText(173, 90, 400, 30, 'right', '');
        this.playerActionText = this.addText(173, 120, 400, 30, 'left', '');
    },

    initWanderingMonsters: function(){
        var monsters = this.monsters = [];
        Object.keys(creatures).forEach(function(name){
            monsters.push(game.add.existing(new Monster(0, 350, name, creatures[name])));
        });
    },

    addWanderingMonster: function(){
        return getWeightedItem(this.monsters).restore()
    },
  };
