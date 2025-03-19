import axios from 'axios';
import { getTokenFromLocalStorage } from '../utils/localStorageUtils';

const API_URL = "https://main-backend-f59ecff5cbde.herokuapp.com";

const studentApi = () => {
    const token = getTokenFromLocalStorage();
    return axios.create({
        baseURL: API_URL,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

const studentService = {


    async getAvailableAssessments() {
        try {
            const res = await studentApi().get('/student/assessments/available');
        } catch (error) {
            throw new Error("Failed to get available assessments");

        }
    }
};