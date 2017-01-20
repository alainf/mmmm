'use strict'


/*
FROM https://cloudant.com/product/pricing/

Data volume in GBs / month  $1.00 per GB / month
"Heavy" API requests * PUTs, POSTs, DELETEs   $0.015 per 100
"Light" API requests * GETs, HEADs  $0.015 per 500
*/

const storage = 1 // per GB per month
const light = 0.015 / 500 // $ per request
const heavy = 0.015 / 100 // $ per request

const nDocs = 50000
const cachePercent = 80
const queriesPerVisit = 5
const visitsPerDay = 50000

const storageCost = nDocs * 600 / 1e9 * storage
const initHeavyCost = nDocs * heavy
const initialCost = storageCost + initHeavyCost
const actionsPerDay = visitsPerDay / 100
const lightPerDay = queriesPerVisit * visitsPerDay
const heavyPerDay = actionsPerDay
const dayLightCost = lightPerDay * light * (1 - cachePercent / 100)
const dayHeavyCost = heavyPerDay * heavy

console.log('nDocs:', nDocs)
console.log('visitsPerDay:', visitsPerDay)
console.log('queriesPerVisit:', queriesPerVisit)
console.log('cachePercent:', cachePercent)
console.log()
console.log('initialCost:', initialCost.toFixed(2))
console.log('Monthly cost:', ((dayHeavyCost + dayLightCost) * 30).toFixed(2))
