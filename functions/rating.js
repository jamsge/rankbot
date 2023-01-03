const ranks = require("../resources/ranks.json")

const ratingOrdinalToRank = (ordinal, dailyGlobalPlacement = null, dailyRegionalPlacement = null) => {
    orderedRanks = ranks["orderedRanks"];
    for (var i = 0; i < orderedRanks.length; ++i){
        if (ordinal >= orderedRanks[i].ratingMin){
            // grandmaster is given when at or above master, and top 300 globally or top x in region
            if (orderedRanks[i].name.includes("Master") && (dailyGlobalPlacement || (dailyRegionalPlacement && dailyRegionalPlacement <= 300))){
                return ranks["unorderedRanks"].Grandmaster;
            }
            
            return orderedRanks[i];
        }
    }
    return ranks["unorderedRanks"].Unranked;
}

module.exports = { ratingOrdinalToRank };