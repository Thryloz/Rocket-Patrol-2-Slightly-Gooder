class Play extends Phaser.Scene{
    constructor(){
        super('playScene');
    }

    create(){
        //(x, y, width, height, key string)
        // added this so we can reference it in the scene
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0,0);           
        
        //create green rectangle at with the given parameters.
        //(x, y, width, height, color)
        // setOrigin(0,0) sets it to upper left
        this.add.rectangle(0, borderUISize+borderPadding, game.config.width, borderUISize*2, 0x00FF00).setOrigin(0,0);
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);   
    
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);
    
        //player input
        keyFIRE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyRESET = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        //ships
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0);
        this.bonusShip = new bonusSpaceship(this, game.config.width, borderUISize*6 + borderUISize*5, 'bonusSpaceship', 0, 40).setOrigin(0,0)
    

        //score
        this.p1Score = 0;

        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig)

        let timerConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.timeInSeconds = game.settings.gameTimer/1000;
        this.timerRight = this.add.text(borderUISize*15, borderUISize + borderPadding*2, this.timeInSeconds, timerConfig)

        this.gameOver = false;
        scoreConfig.fixedWidth = 0;
        // (time elapsed before callback, callback (the arrow function), null, callback context)
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5)
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart', scoreConfig).setOrigin(0.5)
            this.gameOver = true;
        }, null, this)
    }

    update() {
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyRESET)) {
            this.scene.restart();
        }

        this.starfield.tilePositionX -= 4;
        if(!this.gameOver){
            this.p1Rocket.update();
            this.ship01.update();
            this.ship02.update();
            this.ship03.update();
            this.bonusShip.update();
            // timer update
            this.timeInSeconds -= .006;
            this.timerRight.text = this.timeInSeconds;
        }

        if(this.gameOver){
            this.timerRight.text = 0.000;
        }
        

        if (this.checkCollision(this.p1Rocket, this.ship03)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)){
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }

        if (this.checkCollision(this.p1Rocket, this.bonusShip)){
            this.p1Rocket.reset();
            this.shipExplode(this.bonusShip);
        }

        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)){
            this.scene.start('menuScene');
        }
    }

    // collisions management
    checkCollision(rocket, ship){
        if (rocket.x < ship.x + ship.width && rocket.x + rocket.width > ship.x && rocket.y < ship.y + ship.height && rocket.height + rocket.y > ship.y){
            return true;
        } else {
            return false;
        }
    }

    shipExplode(ship){
        ship.alpha = 0; // hides ship
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {   // callback after anim completes
            ship.reset()                         // calls ship reset
            ship.alpha = 1                       // make ship visible again
            boom.destroy()                       // remove explosion sprite
          })

        this.sound.play('sfx-explosion');
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;
    }
}