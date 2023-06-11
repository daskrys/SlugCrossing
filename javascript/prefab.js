class Prefab extends Phaser.Scene 
{
    constructor(key)
    {
        super(key);
    }

    preload ()
    {
        this.load.image('ground', 'assets/ground.png');
        this.load.atlas('player', 'assets/player/playersheet.png', 'JSON/player.json');
        this.load.atlas('slug', 'assets/slug.png', 'JSON/slug.json');
        this.load.atlas('deathslug', 'assets/mean_slug.png', 'JSON/mean_slug.json');
        this.load.atlas('bird', 'assets/bird.png', 'JSON/bird.json');

        this.load.image('background', 'assets/dark back.png');
        this.load.image('obstacle', 'assets/circle.png');
        this.load.image('tree', 'assets/obstacles/Tree.png');

        this.load.image('star', 'assets/star.png');
        this.load.audio('blip', 'assets/blip.mp3');
        this.load.audio('jumpSound', 'assets/jump.mp3');

        this.load.image('audio1', 'assets/audio.png');
        this.load.image('mute1', 'assets/mute.png');
        
    }
    init(data) {
        this.mutevalue = data.mutevalue;
    } 
    create () 
    {
        this.jumpSound = this.sound.add('jumpSound');
        this.config = {
            "jumpvel": "-500",
            "objspd": "-80"

        }
       
        this.background = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, 'background');
        this.background.setOrigin(0, 0);

      
        this.platforms = this.physics.add.staticGroup()
        this.platforms.create(300, 1250, 'ground').setScale(2).refreshBody();
        this.theground = this.add.tileSprite(1000, 1875, this.sys.game.config.width, this.sys.game.config.height, 'ground').setScale(2);
        //this.platforms.create(2400, 1050, 'ground').setScale(1).refreshBody();
        this.anims.create({
            key: 'meanslugrunning',
            frames: this.anims.generateFrameNames('deathslug', {
                prefix: 'meanslug', start: 1, end: 3
            }), 
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'running',
            frames: this.anims.generateFrameNames('player', {
                prefix: 'run', start: 1, end: 6
            }), 
            frameRate: 10,
            repeat: -1,
        });


        this.anims.create({
            key: 'jumping',
            frames: this.anims.generateFrameNames('player', {
                prefix: 'jump', start: 1, end: 6
            }), 
            frameRate: 10,
            repeat: -1,
        });


        this.anims.create({
            key: 'rolling',
            frames: this.anims.generateFrameNames('player', {
                prefix: 'roll', start: 1, end: 6
            }), 
            frameRate: 10,
            repeat: -1,
        });

        // slug animation
        this.anims.create({
            key: 'slugwalk',
            frames: this.anims.generateFrameNames('slug', {
                prefix: 'slug', start: 1, end: 4
            }), 
            frameRate: 10,
            repeat: -1,
        });

        // bird animation
        this.anims.create({
            key: 'birdfly',
            frames: this.anims.generateFrameNames('bird', {
                prefix: 'bird', start: 1, end: 4
            }), 
            frameRate: 10,
            repeat: -1,
        });

        //evil slug
        this.wall= this.physics.add.sprite(150, 690, 'deathslug')
            .setScale(3);    
        //.setImmovable();
        this.wall.anims.play('meanslugrunning');
        this.physics.add.collider(this.wall, this.platforms)
        // player
        this.player = this.physics.add.sprite(800, 655, 'player')
            .setScale(4.5)  
            .setSize(20, 40)
            .setDepth(3);
        this.player.body.setOffset(8, 8)
        this.player.curspeed = 0;
            
            
        this.physics.add.collider(this.player, this.platforms); 
        this.physics.add.overlap(this.player, this.wall, this.endGame, null, this);
        this.player.anims.play('running');

 
        this.obstacle = this.physics.add.group();
        

        this.slugs = this.physics.add.group();


        this.input.on('pointerdown', this.jump, this);
        this.player.airjump = false;


        this.score = 0;
        this.scoreBox = this.add.text(20, 25, 'SCORE: 0', { fontFamily: 'Times', fontSize: '40px', fill: '#FFFFFF' });

        //Particles
        this.emitter = this.add.particles(0, 0, "star",{
            speed: 240,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD',
            frequency: -1
        });
        
    }
    

    collectSlug (player, slug)
    {   const beep = this.sound.add('blip', { loop: false });
        beep.play();
   
        slug.disableBody(true, true);
        
        // updates
        ++this.score;
        this.scoreBox.setText('SCORE: ' + this.score);
            this.emitter.emitParticleAt(this.player.x, this.player.y, 4);
    }

    spawnObstacle ()
    {
        let obstacle = this.obstacle.create(1750, 810, 'obstacle') // breaks if i change to bird
            .setImmovable(true)
            .setCircle(256, 0, 0);
        this.physics.add.collider(this.player, this.obstacle); 
        obstacle.setGravityY(-1000).setGravityX(parseInt(this.config["objspd"])).setScale(0.075);
       
        this.time.delayedCall(Phaser.Math.Between(5000, 10000), this.spawnObstacle, [], this);
    }
    spawnTree(){
        this.tree = this.physics.add.sprite(2320, 605, 'tree')
            .setImmovable(true)
            .setGravityY(-1000)
            .setVelocityX(-500)
            .setScale(6)
            this.time.delayedCall(2000, this.spawnTree, [], this);
    }

    spawnSlug ()
    {
        let slug = this.slugs.create(2320, 756, 'slug');
        slug.setGravityY(-1000).setGravityX(-10).setScale(1.6);
        slug.anims.play('slugwalk');
        this.physics.add.overlap(this.player, slug, this.collectSlug, null, this);


        this.time.delayedCall(Phaser.Math.Between(5000, 10000), this.spawnSlug, [], this);
    }

    hit (player, obstacle)
    {
        obstacle.disableBody(true, true);
        this.player.anims.play('rolling');

        this.time.delayedCall(1500, () => {
            this.player.anims.play('running');
        });


    }

    jump ()
    { 
        this.player.anims.play('jumping');
        
        if(this.player.body.touching.down)
        {

            this.jumpSound.play();
            this.player.setVelocityY(parseInt(this.config["jumpvel"]));
            console.log(this.config["jumpvel"])
            this.recenttime = this.game.getTime();
        }
        else if ((this.player.body.touching.down == false) && ((this.game.getTime() - this.recenttime) > 500) && this.player.airjump){
            this.player.airjump = false;
            this.player.setVelocityY(parseInt(this.config["jumpvel"]));
            
            this.jumpSound.play();

        }

        this.time.delayedCall(1500, () => {
            this.player.anims.play('running');
        });
    }   
    endGame(player, wall){
        this.scene.start('endscreen', { score: this.score })
        
    }
    update () 
    {   
        if(this.player.body.touching.down)
        {
            this.player.airjump = true;
        }

        this.background.tilePositionX += 1;
        this.theground.tilePositionX += 1;
        if(this.physics.collide(this.player, this.obstacle) == true){
            this.player.curspeed = 0;
            this.player.setVelocityX(this.player.curspeed);
        }
        if(this.player.x < 400){
            this.player.setVelocityX(this.player.curspeed)
            this.player.curspeed+= 0.2;
        }
        else{
            this.player.curspeed = 0
            this.player.setVelocityX(this.player.curspeed)
        }
    }
}


