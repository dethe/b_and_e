'use strict';

var creatures = {
    umber_couch: {
        name: 'Umber Couch',
        weight: 1, // how likely to turn up
        health: 200,
        doesDamage: 4,
        hitson: 60,
        cooldown: 30,
        range: 105,
        attackText: "butts its upholstery against you",
        speed: 50,
        loot: [
            {
                name: 'bus ticket',
                upTo: 1,
                chance: 20, // percent
            },
            {
                name: 'coin',
                upTo: 20,
                chance: 90,
            },
            {
                name: 'lost thing',
                upTo: 1,
                chance: 20,
            },
            {
                name: 'bunion ointment',
                upTo: 1,
                chance: 20
            },
        ]
    },
    hand_flayer: {
        name: 'Hand Flayer',
        weight: 2,
        health: 25,
        doesDamage: 6,
        hitson: 80,
        cooldown: 60,
        range: 70,
        attackText: 'slaps you with its slimy hand-tentacles',
        speed: 100,
        loot: [
            {
                name: 'coin',
                upTo: 6,
                chance: 90,
            },
            {
                name: 'lost thing',
                upTo: 1,
                chance: 2,
            },
            {
                name: 'insta-bbq',
                upTo: 1,
                chance: 10
            },
            {
                name: 'broom',
                upTo: 1,
                chance: 5
            },
            {
                name: 'bunion ointment',
                upTo: 1,
                chance: 5
            },
        ],
    },
    bearicorn: {
        name: 'Bearicorn',
        weight: 4,
        health: 150,
        doesDamage: 8,
        hitson: 65,
        cooldown: 60,
        range: 70,
        attackText: 'gores you with its sparkly horn',
        speed: 95,
        loot: [
            {
                name: 'coin',
                upTo: 20,
                chance: 80,
            },
            {
                name: 'lost thing',
                upTo: 1,
                chance: 10,
            },
            {
                name: 'insta-bbq',
                upTo: 1,
                chance: 10
            },
            {
                name: 'broom',
                upTo: 1,
                chance: 10
            },
            {
                name: 'bunion ointment',
                upTo: 1,
                chance: 20
            },
        ]
    },
    ochre_cube: {
        name: 'Ochre Cube',
        weight: 8,
        health: 50,
        doesDamage: 1,
        hitson: 90,
        cooldown: 0,
        range: -35,
        attackText: 'leaves permanent turmeric stains on your clothing',
        speed: 25,
        loot: [
            {
                name: 'coin',
                upTo: 20,
                chance: 80,
            },
            {
                name: 'lost thing',
                upTo: 1,
                chance: 5,
            },
            {
                name: 'insta-bbq',
                upTo: 1,
                chance: 10
            },
            {
                name: 'broom',
                upTo: 1,
                chance: 10
            },
        ]
    },
    owlpig: {
        name: 'Owlpig',
        weight: 16,
        health: 100,
        doesDamage: 6,
        hitson: 50,
        cooldown: 60,
        range: 70,
        attackText: 'pecks visciously at you with its snout',
        speed: 110,
        loot: [
            {
                name: 'coin',
                upTo: 5,
                chance: 80,
            },
            {
                name: 'lost thing',
                upTo: 1,
                chance: 10,
            },
            {
                name: 'insta-bbq',
                upTo: 5,
                chance: 10
            },
        ]
    },
    globlin: {
        name: 'Globlin',
        weight: 32,
        health: 10,
        doesDamage: 2,
        hitson: 80,
        cooldown: 120,
        range: 250,
        attackText: 'throws a globule of itself at you',
        speed: 125,
        loot: [
            {
                name: 'coin',
                upTo: 4,
                chance: 60,
            },
            {
                name: 'insta-bbq',
                upTo: 1,
                chance: 5,
            },
            {
                name: 'broom',
                upTo: 1,
                chance: 10
            },
        ]
    }
}
