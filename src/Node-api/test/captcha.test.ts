import * as chai from 'chai';
import chaiHttp = require('chai-http');
import app from '../src/App';

chai.use(chaiHttp);
const expect = chai.expect;


describe('GET captcha/', () => {
    
  it('should call Google api', async () => {
    return chai.request(app).get('/captcha/google').then(res => {
      expect(res).to.be.json;
      expect(res.status).to.equal(200);     
      expect(res.body.googleResponse.success).to.equal(false);     
    }); 
  });

  it('should call captcha/svg', async () => {
    return chai.request(app).get('/captcha/svg').then(res => {
      expect(res).to.be.json;
      expect(res.status).to.equal(200); 
      expect(res.body).to.have.all.keys(['text', 'data']);     
      expect(res.body.text.length).to.be.greaterThan(30);
      expect(res.body.data.length).to.be.greaterThan(5000);
    }); 
  });

  it('should call captcha/svg/result', async () => {
    const text = encodeURIComponent('U2FsdGVkX1+ssTBLXUPkcXkN9RRAtTpV1j26i/pVvT0='); //7qkU
    chai.request(app).get('/captcha/svg/result' +'?text=' +text +'&result=KFJF' ).then(res => {
      expect(res).to.be.json;
      expect(res.status).to.equal(200); 
      expect(res.body).to.equal(false);
    }); 
    chai.request(app).get('/captcha/svg/result' +'?text=' +text +'&result=7qkU' ).then(res => {
      expect(res).to.be.json;
      expect(res.status).to.equal(200); 
      expect(res.body).to.equal(true);
    }); 
  });




});