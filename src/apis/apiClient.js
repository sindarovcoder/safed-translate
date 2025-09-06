const axios = require("axios");
require("dotenv").config();

const SUPABASE_URL = 'https://lejwziturkfjzxtlpyeq.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxland6aXR1cmtmanp4dGxweWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjk2NjcsImV4cCI6MjA3MDk0NTY2N30.4tclQexmgISM5wV-fTfbIXIVq_BTn0234UtTQoEN3B4';

async function apiRequest(method, endpoint, data = {}, headers = {}) {

    try {

        const options = {
            method,
            url: `${SUPABASE_URL}/rest/v1/${endpoint}`,
            headers: {
                "apikey": SUPABASE_API_KEY,
                "Authorization": `Bearer ${SUPABASE_API_KEY}`,
                "Content-Type": "application/json",
                ...headers,
            },
        };

        if (method === "get" && Object.keys(data).length > 0) {
            options.params = data;
        } else {
            options.data = data;
        }

        // console.log("API Request:", options);
        const response = await axios(options);
        return response.data;
    } catch (error) {

        console.error(error);


        console.error("❌ API xatosi:", error.message);
        throw new Error(JSON.stringify({ message: error.response?.data?.message || error.message }));
    }
}

module.exports = {
    get: async (endpoint, params, chatId, headers) =>
        apiRequest("get", endpoint, params, chatId, headers),
    post: async (endpoint, data, chatId, headers) =>
        apiRequest("post", endpoint, data, chatId, headers),
    patch: async (endpoint, data, chatId, headers) =>
        apiRequest("patch", endpoint, data, chatId, headers),
    delete: async (endpoint, data, chatId, headers) =>
        apiRequest("delete", endpoint, data, chatId, headers),
};
