const axios = require("axios")

const getSlippiProfile = async (connectCode) => {
  const res = await axios.post("https://gql-gateway-dot-slippi.uc.r.appspot.com/graphql", {
    query: `
    fragment userProfilePage on User {
      displayName
      connectCode {
        code
      }
      rankedNetplayProfile {
        ratingOrdinal
        ratingUpdateCount
        wins
        losses
        dailyGlobalPlacement
        dailyRegionalPlacement
        continent
        characters {
          character
          gameCount
        }
      }
    }
    
    query AccountManagementPageQuery($cc: String!) {
      getConnectCode(code: $cc) {
        user {
          ...userProfilePage
          __typename
        }
        __typename
      }
    }`,
    variables: {
      "cc": connectCode
    }
  }, {
    headers: {
      "Content-Type":"application/json"
    }
  })

  return res;
}

module.exports = { getSlippiProfile };