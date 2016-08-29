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
    this.load.image('bearicorn', 'assets/images/bearicorn/bearicorn_1_sm.png', 70, 112)
    this.load.image('beerholder', 'assets/images/beerholder/beerholder_1_sm.png', 130, 140)
    this.load.image('cimim', 'assets/images/cimim/cimim_1_sm.png', 108, 140)
    this.load.image('globlin', 'assets/images/globlin/globlin_1_sm.png', 57, 70)
    this.load.image('hand_flayer', 'assets/images/hand_flayer/hand_flayer_1_sm.png', 70, 121)
    this.load.image('ochre_cube', 'assets/images/ochre_cube/ochre_cube_1_sm.png', 140, 121)
    this.load.image('owlpig', 'assets/images/owlpig/owlpig_1_sm.png', 51, 140)
    this.load.image('umber_couch', 'assets/images/umber_couch/umber_couch_1_sm.png', 140, 70)
    this.load.spritesheet('torch_sheet', 'assets/images/torch/torch_sheet.png', 70, 70)
  },
  create: function() {
    this.state.start('Game');
  }
};
