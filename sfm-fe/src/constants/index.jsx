export const API_URL = 'http://localhost:8000/api/users/';
export const ROI_API = 'http://localhost:8000/api/ROI/';

export const regionDivided = (number, srid) => {
  fetch(`${ROI_API}/${number}/${srid}`);
};
export const postGeojsonData = (bodyFormdata) => {
  fetch({
    url: ROI_API,
    method: 'POST',
    body: bodyFormdata,
  });
};
