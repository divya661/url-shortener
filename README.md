# url-shortener
Description: Project is build using Angular, Node.js, Express.js, MySQL
Use Case: 
1. This is a url shortener web app which converts the original url to short and on using the short url generated it redirects the user to the original URL.
2. User can also give his own custom name(optional) for the url which will be attached to the root url to form the full url which will be in usable form. This should be of min length of 5 characters.
3. On statistics page, on entering a valid custom url address either full url or short url id/ custom name to get the insights about it. That is, shows the total num of views of the custom url, viewer ip, generates the graph of views/month

## Run Command to start the front-server: For angular project 
1. `cd app-ui\url-shortener`
2. `npm install`
3. `ng serve`
4. `http://localhost:4200/index`

## Run command to start the backend server: For node.js( runs on port no 3000)
1. `cd app-server`
2. `npm install`
3. Change the `password` in `db_config.js` file to password of your database in `app-server` folder
4. Create the tables `urls` and `stats` in your database by running the below given DDL commands
5. `npm start`

### Schema for urls table:
`create table urls(url_id int not null auto_increment,url_original varchar(5000) not null,url_short varchar(100),url_datetime datetime, url_ip varchar(16),url_num_of_views int,primary key(url_id) );`

### Schema for stats table:
`create table stats(stat_id int auto_increment, url_id int,click_date datetime,url_ip varchar(16),url_short varchar(100),primary key(stat_id),constraint fk_url_id foreign key(url_id) references urls(url_id) on delete cascade);`

mysql> show tables;
+-------------------------+
| Tables_in_url_shortener |
+-------------------------+
| stats                   |
| urls                    |
+-------------------------+

mysql> desc urls;
+------------------+---------------+------+-----+---------+----------------+
| Field            | Type          | Null | Key | Default | Extra          |
+------------------+---------------+------+-----+---------+----------------+
| url_id           | int(11)       | NO   | PRI | NULL    | auto_increment |
| url_original     | varchar(5000) | NO   |     | NULL    |                |
| url_short        | varchar(100)  | YES  |     | NULL    |                |
| url_datetime     | datetime      | YES  |     | NULL    |                |
| url_ip           | varchar(16)   | YES  |     | NULL    |                |
| url_num_of_views | int(11)       | YES  |     | NULL    |                |
+------------------+---------------+------+-----+---------+----------------+

mysql> desc stats;
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| stat_id    | int(11)      | NO   | PRI | NULL    | auto_increment |
| url_id     | int(11)      | YES  | MUL | NULL    |                |
| click_date | datetime     | YES  |     | NULL    |                |
| url_ip     | varchar(16)  | YES  |     | NULL    |                |
| url_short  | varchar(100) | YES  |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+

After running on my localhost results were obtained by me are concluded in the following below images:
Main site
1. home_page.jpg
2. result_page.jpg
3. stat_page.jpg
Database result images:
1. urls_mysql_table.jpg
2. stats_mysql_table.jpg
Backend server results:
1. custom_url_name_added.jpg
2. added_new_url.jpg
3. statistics_api_result.jpg 