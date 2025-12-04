import ApiService from './framework/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class HabitsApiService extends ApiService {
  get habits() {
    return this._load({url: 'habits'})
      .then(ApiService.parseResponse)
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Error fetching habits:', error);
        throw error;
      });
  }

  async addHabit(habit) {
    const response = await this._load({
      url: 'habits',
      method: Method.POST,
      body: JSON.stringify(habit),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const result = await ApiService.parseResponse(response);
    return result;
  }

  async updateHabit(habit) {
 
    const response = await this._load({
      url: `habits/${habit.id}`,
      method: Method.PUT,
      body: JSON.stringify(habit),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const parsedResponse = await ApiService.parseResponse(response);
    return parsedResponse;
  }

  async deleteHabit(id) {
    const response = await this._load({
      url: `habits/${id}`,
      method: Method.DELETE,
    });

    return response;
  }
}