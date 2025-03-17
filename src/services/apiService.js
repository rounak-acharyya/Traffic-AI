import axios from "axios";

const API_URL = "http://127.0.0.1:8000"; // FastAPI backend URL

export const predictTraffic = async (inputData) => {
    try {
        const response = await axios.post(`${API_URL}/predict`, inputData);
        return response.data;
    } catch (error) {
        console.error("Error fetching prediction:", error);
        return null;
    }
};
