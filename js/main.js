var SideScroller = SideScroller || {};
window.game = new Phaser.Game(746, 420, Phaser.AUTO, '');
game.state.add('Boot', SideScroller.Boot);
game.state.add('Preload', SideScroller.Preload);
game.state.add('Level', SideScroller.Level);
game.state.start('Boot');
