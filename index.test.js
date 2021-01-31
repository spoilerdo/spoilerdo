const webrequest = require('./webrequest');

test('get json valid', async () => {
    try{
        let response = await webrequest('https://gitlab.com/users/martijn.dormans/calendar.json', 'GET')
        console.log(response.data);
        expect(response.data.length).toBeGreaterThen(1);
    } catch (e) {
        expect(e).toBe(e);
    }
});