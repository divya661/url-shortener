exports.root_url = "http://localhost:3000/urlShort/";
exports.min_vanity_length = 5;
exports.num_of_urls_per_hour = 1000;

exports.get_all_urls_query = 'SELECT * FROM urls WHERE url_short = {URL_SHORT}';
exports.add_url_query = 'INSERT INTO urls SET url_original = {URL}, url_short = {URL_SHORT}, url_ip = {URL_IP},url_datetime = now()';
exports.check_url_query = 'SELECT * FROM urls WHERE url_original = {URL}';
exports.update_views_query = 'UPDATE urls SET url_num_of_views = {VIEWS} WHERE url_id = {URL_ID}';
exports.insert_view = 'INSERT INTO stats SET url_id={URL_ID},click_date = now(),url_ip = {URL_IP},url_short = {URL_SHORT}';
exports.check_ip_query = 'SELECT COUNT(url_id) AS url_count FROM urls WHERE url_datetime >= now() - INTERVAL 1 HOUR AND url_ip = {URL_IP}';
exports.get_viewers_query = 'SELECT stat_id,url_ip,click_date from stats where url_id = {URL_ID}';