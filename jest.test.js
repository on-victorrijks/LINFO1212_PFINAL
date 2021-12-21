const fs = require('fs');
const path = require('path');

const chrome = require('selenium-webdriver/chrome');
const { Builder, until, By } = require('selenium-webdriver');

const script = require('jest');
const { beforeAll, afterAll } = require('@jest/globals');
const { text } = require('body-parser');

var chromeOptions  = new chrome.Options();
chromeOptions.addArguments('ignore-certificate-errors');
chromeOptions.addArguments('--start-maximized');

const exampleImage = path.join(__dirname, '/Test_selenium/images_test/1.jpg');


const credentials = {
  "resident": {
    email: "resident@email.com",
    password: "123456"
  },
  "landlord": {
    email: "vera.cruz@erachatelain.be",
    password: "123456"
  },
  "landlord2": {
    email: "cruz.vera@erachatelain.be",
    password: "123456"
  }
}

function connect(driver, email, password, connected) {
  driver.get("https://localhost:8080/login");

  const input_email     = driver.findElement(By.name('email'));
  const input_password  = driver.findElement(By.name('password'));

  input_email.sendKeys(email);
  input_password.sendKeys(password);

  driver.findElement(By.css('button.submit')).click();

  setTimeout(() => {
    connected();
  }, 1500)

}

// declaring one test group, with common initialisation.
describe('Execute tests on KotKot', () => {

  let driver;
  
  beforeAll(async () => {    
    driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();

    /*
    // accept security dialog
    await driver.get("https://localhost:8080");
    driver.findElement(By.css('#details-button')).click();
    driver.findElement(By.css('#proceed-link')).click();
    */

  }, 10000);
 
  afterAll(async () => {
    return;
    await driver.quit();
  }, 15000);
  
  
  test('Create account for resident', async () => {
    await driver.get("https://localhost:8080/register");

    const input_firstname = driver.findElement(By.name('firstname'));
    const input_lastname = driver.findElement(By.name('lastname'));
    const input_email = driver.findElement(By.name('email'));
    const input_phonenumber = driver.findElement(By.name('phonenumber'));
    const input_companyName = driver.findElement(By.name('companyName'));
    const input_password1 = driver.findElement(By.name('password'));
    const input_password2 = driver.findElement(By.name('password_verif'));
    
    input_firstname.sendKeys("TEST#Firstname");
    input_lastname.sendKeys("TEST#Lastname");
    input_email.sendKeys(credentials["resident"]["email"]);
    input_phonenumber.sendKeys("0450675037");
    input_companyName.sendKeys("TEST#CompanyName");
    input_password1.sendKeys(credentials["resident"]["password"]);
    input_password2.sendKeys(credentials["resident"]["password"]);

    driver.findElement(By.css('button.submit')).click();

  });

  test('Create account for landlord', async () => {
    await driver.get("https://localhost:8080/register");

    const input_type = driver.findElement(By.name('type'));
    const input_firstname = driver.findElement(By.name('firstname'));
    const input_lastname = driver.findElement(By.name('lastname'));
    const input_email = driver.findElement(By.name('email'));
    const input_phonenumber = driver.findElement(By.name('phonenumber'));
    const input_companyName = driver.findElement(By.name('companyName'));
    const input_password1 = driver.findElement(By.name('password'));
    const input_password2 = driver.findElement(By.name('password_verif'));
    
    input_firstname.sendKeys("TEST#Firstname");
    input_lastname.sendKeys("TEST#Lastname");
    input_email.sendKeys(credentials["landlord"]["email"]);
    input_phonenumber.sendKeys("0450675037");
    input_companyName.sendKeys("TEST#CompanyName");
    input_password1.sendKeys(credentials["landlord"]["password"]);
    input_password2.sendKeys(credentials["landlord"]["password"]);

    driver.findElement(By.css('button.submit')).click();

  });

  /*test('Create account for landlord2', async () => {
    await driver.get("https://localhost:8080/register");

    const input_type = driver.findElement(By.name('type'));
    const input_firstname = driver.findElement(By.name('firstname'));
    const input_lastname = driver.findElement(By.name('lastname'));
    const input_email = driver.findElement(By.name('email'));
    const input_phonenumber = driver.findElement(By.name('phonenumber'));
    const input_companyName = driver.findElement(By.name('companyName'));
    const input_password1 = driver.findElement(By.name('password'));
    const input_password2 = driver.findElement(By.name('password_verif'));
    
    input_type.sendKeys("Je suis un propriétaire (Propriétaire)");
    input_firstname.sendKeys("TEST#Firstname2");
    input_lastname.sendKeys("TEST#Lastname2");
    input_email.sendKeys(credentials["landlord2"]["email"]);
    input_phonenumber.sendKeys("0450675035");
    input_companyName.sendKeys("TEST#CompanyName");
    input_password1.sendKeys(credentials["landlord2"]["password"]);
    input_password2.sendKeys(credentials["landlord2"]["password"]);

    driver.findElement(By.css('button.submit')).click();

  });*/
  

  /*test('Create new kot', async () => {
    const email = credentials["landlord2"]["email"];
    const password = credentials["landlord2"]["password"];
    connect(driver, email, password, async(done) => {

      await driver.get("https://localhost:8080/kot/create")

      const input_title = driver.findElement(By.name('title'));
      const textarea_description = driver.findElement(By.css('textarea[name="description"]'));
      const input_localisation = driver.findElement(By.name('localisation'));
      const input_addPictures = driver.findElement(By.name("pictures"));
      const input_isOpen = driver.findElement(By.name('isOpen'));
      const input_availability = driver.findElement(By.name('availability'));
      const input_isCollocation = driver.findElement(By.name('isCollocation'));
      const input_maxTenant = driver.findElement(By.name('maxTenant'));
      const input_title = driver.findElement(By.name('basePrice'));
      const input_chargePrice = driver.findElement(By.name('chargePrice'));
      const input_bedrooms = driver.findElement(By.name('bedrooms'));
      const input_bathrooms = driver.findElement(By.name('bathrooms'));
      const input_toilets = driver.findElement(By.name('toilets'));
      const input_type = driver.findElement(By.name("type"));
      const input_surface = driver.findElement(By.name('surface'));
      const input_floors = driver.findElement(By.name('floors'));
      const input_constructionYear = driver.findElement(By.name('constructionYear'));
      const input_parking = driver.findElement(By.name('parking'));
      const input_furnished = driver.findElement(By.name('furnished'));
      const input_petFriendly = driver.findElement(By.name('petFriendly'));
      const input_garden = driver.findElement(By.name('garden'));
      const input_terrace = driver.findElement(By.name('terrace'));
  
      input_title.sendKeys("TEST#Title");
      input_localisation.sendKeys("Pl. Rabelais 38, 1348 Ottignies-Louvain-la-Neuve");
      driver.findElement(By.id('searchLocalisationButton')).click();
      input_addPictures.sendKeys(exampleImage);
      input_isOpen.sendKeys("Oui");
      input_availability.sendKeys("15-01-2022");
      input_isCollocation.sendKeys("Oui");
      input_maxTenant.sendKeys("5");
      input_title.sendKeys("475");
      input_chargePrice.sendKeys("25");
      input_bedrooms.sendKeys("2");
      input_bathrooms.sendKeys("1");
      input_toilets.sendKeys("2");
      input_type.sendKeys("Appartement");
      input_surface.sendKeys("30");
      input_floors.sendKeys("1");
      input_constructionYear.sendKeys("2015");
      input_parking.sendKeys("0");
      input_furnished.sendKeys("Non");
      input_petFriendly.sendKeys("Petits animaux");
      input_garden.sendKeys("Non");
      input_terrace.sendKeys("Oui");
      
      textarea_description.click();
      textarea_description.sendKeys("TEST#description");

      driver.findElement(By.id('publish_btn')).click();
      driver.findElement(By.id('publish_btn')).click();

    });
  })*/

  test('Add kot to fav', async () => {
    const email = credentials["resident"]["email"];
    const password = credentials["resident"]["password"];
    connect(driver, email, password, async(done) => {
      await driver.get("https://localhost:8080/kot/profile/61c1e92c3e7c66ab959d491f")
      driver.findElement(By.id("fav_false")).click()

      await driver.get("https://localhost:8080/kot/favs")

    })

  });

  test('Modify a kot', async () => {
    const email = credentials["landlord2"]["email"];
    const password = credentials["landlord2"]["password"];
    connect(driver, email, password, async(done) => {
      await driver.get("https://localhost:8080/kot/modify/61c1e92c3e7c66ab959d491f");

      

      const input_title = driver.findElement(By.name('title'));
      input_title.clear()
      input_title.click()
      input_title.sendKeys("title2");

      textarea_description.clear()
      textarea_description.click();
      textarea_description.sendKeys("TEST#description2");
    })

  });

});
