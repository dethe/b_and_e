var SideScroller = SideScroller || {};
//loading the game assets
SideScroller.Preload = function(){};
SideScroller.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);
    this.load.setPreloadSprite(this.preloadBar);
    //load game assets
    this.load.tilemap('level1', 'assets/tilemaps/dungeon_tileset.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', 'assets/images/map_sheet.png');
    this.load.image('player_sprite', 'assets/images/character_sheet.png');
    this.load.spritesheet('player', 'assets/images/character_sheet.png', 70, 140)
    this.load.image('playerDuck', 'assets/images/player_duck.png');
    this.load.image('playerDead', 'assets/images/player_dead.png');
    this.load.image('coin', 'assets/images/goldCoin.png');
    this.load.audio('coin', 'assets/audio/coin.wav');
  },
  create: function() {
    this.state.start('Game');
  }
};
