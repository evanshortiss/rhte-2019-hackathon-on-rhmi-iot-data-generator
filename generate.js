require('make-promises-safe')

const log = require('barelog')
const csv = require('csvtojson')
const weightedRandom = require('weighted-random')
const { resolve } = require('path')

// These will be assigned JSON by "main"
let junctionList
let meterList

const meterStates = [
  {
    weight: 0.5,
    text: 'occupied'
  },
  {
    weight: 0.2,
    text: 'available'
  },
  {
    weight: 0.2,
    text: 'unknown'
  },
  {
    weight: 0.1,
    text: 'out-of-service'
  }
]

main()

async function main () {
  junctionList = await csv().fromFile(
    resolve(__dirname, './data/junction_info.csv')
  )
  meterList = await csv().fromFile(
    resolve(__dirname, './data/meter_info.csv')
  )

  // Assign random weights to junctions on startup
  assignJunctionWeights()
  // Set initial meter and junction states
  updateMeters()
  updateJunctions()

  // Simulate flushing sensors every minute
  setInterval(() => {
    const start = Date.now()

    performUpdates()

    log('Updating meters and junctions executed in %dms', Date.now() - start)
  }, 60 * 1000)
}

function performUpdates () {
  const start = Date.now()

  updateMeters()
  updateJunctions()

  log('Updating meters and junctions executed in %dms', Date.now() - start)
}

function updateJunctions () {
  const timestamp = Date.now()

  junctionList.forEach((j) => {
    const counts = {
      ew: Math.round(Math.random() * j.weight),
      ns: Math.round(Math.random() * j.weight)
    }

    const junctionId = j.id

    const update = {
      junctionId,
      timestamp,
      counts
    }

    j.counts = counts

    // Our goal is to push to a topic, but console.log is ok for testing
    log(`Emit Junction Update: ${JSON.stringify(update)}`)
  })
}

/**
 * Update meters per our planned paramaters
 */
function updateMeters () {
  const timestamp = Date.now()

  meterList.forEach(m => {
    const status = getWeightedRandomMeterStatus().text
    const meterId = m.id

    const update = {
      meterId,
      timestamp,
      status
    }

    m.status = status

    // Our goal is to push to a topic, but console.log is ok for testing
    log(`Emit Meter Update: ${JSON.stringify(update)}`)
  })

  const counts = meterList.reduce((memo, cur) => {
    if (memo[cur.status]) {
      memo[cur.status]++
    } else {
      memo[cur.status] = 1
    }

    return memo
  }, {})

  log('Meter Status Summary:\n', JSON.stringify(counts, null, 2))
}

function getWeightedRandomMeterStatus () {
  const selectionIdx = weightedRandom(meterStates.map(val => val.weight))
  return meterStates[selectionIdx]
}

/**
 * We need to weight junctions in batches to simulate traffic hotspots
 * This function will assign a weight of W to N junctions repeatedly
 * until all junctions have a weight
 */
function assignJunctionWeights () {
  let i = 0

  while (i < junctionList.length) {
    // Number of junctions for this batch. Using a random range creates
    // busy and not so busy clusters of junctions
    const n = getRandomInt(15, 50)
    // 0-10 scale for weight, or "busyness" of junctions
    const w = getRandomInt(10, 50)

    for (let j = 0; j <= n; j++) {
      if (junctionList[i + j]) {
        junctionList[i + j].weight = w
      }
    }

    i += n
  }
}

/**
 * Return an integer in the given range
 * @param {Number} min
 * @param {Number} max
 */
function getRandomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min + 1)) + min
}