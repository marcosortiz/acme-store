const axios = require('axios');

const URL = `${process.env.ECS_CONTAINER_METADATA_URI_V4}/task`

module.exports = {
    getAz: async function () {
        console.log(`Fetching metadata from ${URL} ...`)
        try {
            const response = await axios.get(URL, { timeout: 3000 });
            return response.data.AvailabilityZone;
        } catch (error) {
            console.log(error, error.stack);
        }
    }
}
