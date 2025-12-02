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
      .then(ApiService.parseResponse);
  }

  async addHabit(habit) {
    const response = await this._load({
      url: 'habits',
      method: Method.POST,
      body: JSON.stringify(habit),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    return ApiService.parseResponse(response);
  }

  async updateHabit(habit) {
    const response = await this._load({
      url: `habits/${habit.id}`,
      method: Method.PUT,
      body: JSON.stringify(habit),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    return ApiService.parseResponse(response);
  }

  async deleteHabit(id) {
    const response = await this._load({
      url: `habits/${id}`,
      method: Method.DELETE,
    });

    return response;
  }
}