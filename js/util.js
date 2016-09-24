'use strict';

function getWeightedItem(list){
    var totalWeight = 0;
    for (var i = 0; i< list.length; i++){
        totalWeight += list[i].weight;
    }
    var choice = game.rnd.integerInRange(1, totalWeight);
    for (var i = 0; i < list.length; i++){
        choice -= list[i].weight;
        if (choice < 1){
            return list[i];
        }
    }
    throw new Error('we should not be able to get here');
}
