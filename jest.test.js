const chrome = require('selenium-webdriver/chrome');
const { Builder, until, By } = require('selenium-webdriver');

const script = require('jest');
const { beforeAll, afterAll } = require('@jest/globals');

var chromeOptions  = new chrome.Options();
chromeOptions.addArguments('ignore-certificate-errors');
chromeOptions.addArguments('--start-maximized');
  
const credentials = {
  "resident": {
    email: "resident@email.com",
    password: "123456"
  },
  "landlord": {
    email: "landlord@email.com",
    password: "123456"
  }
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

  /*
  test('Check account login', async () => {
    await driver.get("https://localhost:8080/login");
    let title = await driver.getTitle();
    console.log(title);
  });
  */

});
