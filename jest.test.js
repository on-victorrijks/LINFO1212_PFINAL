const fs = require('fs');
const path = require('path');

const chrome = require('selenium-webdriver/chrome');
const { Builder, until, By } = require('selenium-webdriver');

const script = require('jest');
const { beforeAll, afterAll, expect } = require('@jest/globals');

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
    email: "landlord@email.com",
    password: "123456"
  },
  "landlord2": {
    email: "cruz.vera@erachatelain.be",
    password: "123456"
  }
}

const config = {
  shouldCreateAccount: false,
}
let GLOBAL_createdKotID = undefined;


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function connect(driver, email, password, connected) {

  await driver.get("https://localhost:8080/disconnect");await sleep(500); // reset connection

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
    if(!config.shouldCreateAccount) return;

    await driver.get("https://localhost:8080/register");

    const input_acccountType = driver.findElement(By.name('type'));
    const input_firstname = driver.findElement(By.name('firstname'));
    const input_lastname = driver.findElement(By.name('lastname'));
    const input_email = driver.findElement(By.name('email'));
    const input_phonenumber = driver.findElement(By.name('phonenumber'));
    const input_password1 = driver.findElement(By.name('password'));
    const input_password2 = driver.findElement(By.name('password_verif'));
    
    input_acccountType.sendKeys("Je recherche un kot (Résident)");
    input_firstname.sendKeys("TEST#Firstname");
    input_lastname.sendKeys("TEST#Lastname");
    input_email.sendKeys(credentials["resident"]["email"]);
    input_phonenumber.sendKeys("0450675037");
    input_password1.sendKeys(credentials["resident"]["password"]);
    input_password2.sendKeys(credentials["resident"]["password"]);

    driver.findElement(By.css('button.submit')).click();

    await sleep(1000);

    const url = await driver.getCurrentUrl();
    const urlParams = url.split("?")[1];
    const urlSearchParams = new URLSearchParams(urlParams);

    const error = urlSearchParams.has('error') ? urlSearchParams.get('error') : false;
    const success = urlSearchParams.has('success') ? urlSearchParams.get('success') : false;

    expect(error).toBeFalsy();
    expect(success).toBe("ACCOUNT_CREATED");

  });

  test('Create account for landlord', async () => {
    if(!config.shouldCreateAccount) return;

    await driver.get("https://localhost:8080/register");

    const input_acccountType = driver.findElement(By.name('type'));
    const input_firstname = driver.findElement(By.name('firstname'));
    const input_lastname = driver.findElement(By.name('lastname'));
    const input_email = driver.findElement(By.name('email'));
    const input_phonenumber = driver.findElement(By.name('phonenumber'));
    const input_companyName = driver.findElement(By.name('companyName'));
    const input_password1 = driver.findElement(By.name('password'));
    const input_password2 = driver.findElement(By.name('password_verif'));
    
    input_acccountType.sendKeys("Je suis un propriétaire (Propriétaire)");
    input_firstname.sendKeys("TEST#Firstname");
    input_lastname.sendKeys("TEST#Lastname");
    input_email.sendKeys(credentials["landlord"]["email"]);
    input_phonenumber.sendKeys("0450675037");
    input_companyName.sendKeys("TEST#CompanyName");
    input_password1.sendKeys(credentials["landlord"]["password"]);
    input_password2.sendKeys(credentials["landlord"]["password"]);

    driver.findElement(By.css('button.submit')).click();

    await sleep(1000);

    const url = await driver.getCurrentUrl();
    const urlParams = url.split("?")[1];
    const urlSearchParams = new URLSearchParams(urlParams);

    const error = urlSearchParams.has('error') ? urlSearchParams.get('error') : false;
    const success = urlSearchParams.has('success') ? urlSearchParams.get('success') : false;

    expect(error).toBeFalsy();
    expect(success).toBe("ACCOUNT_CREATED");

  });

  test('Check connection for resident account', async () => {

    await driver.get("https://localhost:8080/disconnect");await sleep(500); // reset connection

    await driver.get("https://localhost:8080/login");

    const input_email = driver.findElement(By.name('email'));
    const input_password = driver.findElement(By.name('password'));
    
    input_email.sendKeys(credentials["resident"]["email"]);
    input_password.sendKeys(credentials["resident"]["password"]);

    driver.findElement(By.css('button.submit')).click();

    await sleep(1000);

    const url = await driver.getCurrentUrl();
    const urlParams = url.split("?")[1];
    const urlSearchParams = new URLSearchParams(urlParams);

    const error = urlSearchParams.has('error') ? urlSearchParams.get('error') : false;
    const success = urlSearchParams.has('success') ? urlSearchParams.get('success') : false;

    expect(error).toBeFalsy();
    expect(success).toBe("CONNECTED");

  });

  test('Check connection for landlord account', async () => {

    await driver.get("https://localhost:8080/disconnect");await sleep(500); // reset connection
    
    await driver.get("https://localhost:8080/login");

    const input_email = driver.findElement(By.name('email'));
    const input_password = driver.findElement(By.name('password'));
    
    input_email.sendKeys(credentials["landlord"]["email"]);
    input_password.sendKeys(credentials["landlord"]["password"]);

    driver.findElement(By.css('button.submit')).click();

    await sleep(1000);

    const url = await driver.getCurrentUrl();
    const urlParams = url.split("?")[1];
    const urlSearchParams = new URLSearchParams(urlParams);

    const error = urlSearchParams.has('error') ? urlSearchParams.get('error') : false;
    const success = urlSearchParams.has('success') ? urlSearchParams.get('success') : false;

    expect(error).toBeFalsy();
    expect(success).toBe("CONNECTED");

  });

  test('Create new kot', (doneJest) => {
    executeAsynchonousTestWithCallback = async() => {
      const email = credentials["landlord"]["email"];
      const password = credentials["landlord"]["password"];
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
        const input_basePrice = driver.findElement(By.name('basePrice'));
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
        textarea_description.click();
        textarea_description.sendKeys("TEST#description");
        input_localisation.sendKeys("TEST#localisation");
        driver.findElement(By.id('searchLocalisationButton')).click();
        await sleep(500);
        input_addPictures.sendKeys(exampleImage);
        input_isOpen.sendKeys("Oui");
        input_availability.sendKeys("15-01-2022");
        input_isCollocation.sendKeys("Oui");
        input_maxTenant.sendKeys("5");
        input_basePrice.sendKeys("475");
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

        driver.findElement(By.css('button#publish_btn')).click();

        await sleep(1000);

        const url = await driver.getCurrentUrl();
        
        const urlSubParts = url.split("/");
        const kotID = urlSubParts[urlSubParts.length - 1];

        GLOBAL_createdKotID = kotID;
        
        doneJest();
        
      });
    }
    executeAsynchonousTestWithCallback();
    // This "weird" structure is needed because we want to execute an asynchonous test but still keep an order in the tests using a callback
  })

  test('Modify kot', (doneJest) => {
    expect(GLOBAL_createdKotID).not.toBe(undefined);
    executeAsynchonousTestWithCallback = async() => {
      const email = credentials["landlord"]["email"];
      const password = credentials["landlord"]["password"];
      connect(driver, email, password, async(done) => {

        await driver.get("https://localhost:8080/kot/modify/" + GLOBAL_createdKotID);

        const input_title = driver.findElement(By.name('title'));

        input_title.clear();
        input_title.sendKeys("TEST#Title_modified");

        driver.findElement(By.css('button#modify_btn')).click();

        await sleep(1000);

        const titleElement = await driver.findElement(By.xpath("/html/body/div[2]/div/div[2]/div[1]/div[2]/div[1]/h1")).getText();
        expect(titleElement).toBe("TEST#Title_modified");
        doneJest();
        
      });
    }
    executeAsynchonousTestWithCallback();
    // This "weird" structure is needed because we want to execute an asynchonous test but still keep an order in the tests using a callback
  }, 10000);

  test('Add kot to favourites', (doneJest) => {
    expect(GLOBAL_createdKotID).not.toBe(undefined);
    executeAsynchonousTestWithCallback = async() => {
      const email = credentials["resident"]["email"];
      const password = credentials["resident"]["password"];
      connect(driver, email, password, async(done) => {

        await driver.get("https://localhost:8080/kot/profile/" + GLOBAL_createdKotID);

        driver.findElement(By.css('button.favBtn')).click();

        await sleep(250);
        await driver.get("https://localhost:8080/kot/favs");
        await sleep(500);

        const kotsContainerHasKots = await driver.findElement(By.css('.kotsContainer')).getAttribute("haskots");
        expect(kotsContainerHasKots).toBe("true");

        doneJest();
        
      });
    }
    executeAsynchonousTestWithCallback();
    // This "weird" structure is needed because we want to execute an asynchonous test but still keep an order in the tests using a callback
  }, 10000);

});
