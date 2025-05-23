import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/books';

export const bookService = {
  async getAllBooks() {
    const response = await axios.get(API_URL);
    return response.data;
  },

  async searchBooks(query) {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/search/books`, {
      params: { query }
    });
    return response.data;
  },

  async rateBook(bookId, rating) {
    const response = await axios.post(`${API_URL}/rate`, {
      bookId,
      rating
    });
    return response.data;
  }
};