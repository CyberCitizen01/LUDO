#!/usr/bin/env python3
from os import getenv
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import requests, time
from requests.exceptions import ConnectionError

port = getenv('PORT', 3000)
url = f'http://localhost:{port}/'
users = {}

#head over to url
try:
    res = requests.get(url)
except ConnectionError:
    print('Page not reachable(connection refused)-\n\
    Please check or restart the node server by:\n\
        npn run develop')
    exit(1)
else:
    chromedriver = 'chromedriver' if __import__('shutil').which('chromedriver') is not None else './drivers/chromedriver'
    chrome_driver = webdriver.Chrome(chromedriver)
    chrome_driver.get(url)

print('In',chrome_driver.title)

chrome_driver.find_element_by_xpath('/html/body/div[3]/div[3]/button').click()
chrome_driver.find_element_by_xpath('/html/body/div[2]/div/form/input[2]').click()
chrome_driver.find_element_by_xpath('/html/body/div[2]/div/form/button').click()
print('In',chrome_driver.title)

username = chrome_driver.find_element_by_xpath('/html/body/div[1]/h3').text
users[username[2:].split()[0].lower()] = chrome_driver.current_window_handle
print(username,type(username),len(username),'\n',users)

# chrome_driver.close()
