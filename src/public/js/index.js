(function (win) {
    function getData(callback) {
        $.ajax({
            url: '/data',
            success: function(results) {
                callback(results);
            },
            error: function(xhr, status, error) {
                callback(null, error);
            }
        });
    }

    let firstRun = true;
    let refreshInterval = 1;
    let prevItems = [];
    function updateMainPage() {
        getData(function (results, error) {
            try {
                if (error) {
                    console.error('ajax error: ', error);

                } else if (results && results.config) {
                    const items = results.data.items;

                    const config = results.config;

                    if (JSON.stringify(items) !== prevItems) {
                        prevItems = JSON.stringify(items);
                        
                        let filter = document.getElementById('vaxx');
                        let allOptions = [];

                        var trends = document.getElementById('trends'), trend, i;
                        for (var i = 0; i < filter.options.length; i++){
                            var option = filter.options[i];
                            allOptions.push(option.value);
                          }

                        $('#updated').text(new Date().toLocaleString());
                        $('#base_site').text(config.base);
                        $('#base_site')[0].href = config.base;

                        $('#region_float').text(config.region);
                        if (firstRun) {
                            document.title = `${config.region} ${document.title}`;
                            firstRun = false;
                        }

                        const template = $('#item_template').html();

                        let newItems = [];

                        if (items.length === 0) {
                            highlightedItems = {};
                        }
                        for (let i = 0; i < items.length; i++) {
                            const itm = items[i];
                    
                            let tmp = template;
                            for (let prop in itm) {
                                tmp = tmp.replace(new RegExp (`\{${prop}\}`, 'g'), itm[prop]);
                            }

                            // build the list of options in the filter
                            if (itm.offered) {
                                const allOffered = itm.offered.split(',');

                                for (let i = 0; i < allOffered.length; i++){
                                    let val = allOffered[i].trim();
                                    if (allOptions.indexOf(val) === -1) {
                                        let opt = document.createElement('option');
                                        opt.value = val;
                                        opt.innerHTML = val;
                                        filter.appendChild(opt);
                                        allOptions.push(val);
                                    }
                                }
                            }

                            newItems.push(tmp);
                        }

                        $('#items').html(newItems.join(''));
                    }

                    refreshInterval = config.refresh;
                }

            } catch (e){
                console.error('client error: ', e);
            }
            filterResults();
            setTimeout(updateMainPage, refreshInterval * 1000);

        });

    }

    win.main = updateMainPage;

    win.filterResults = function() {
        const sel = $('#vaxx')[0];
        const val = sel[sel.selectedIndex].value;

        const items = $('div.item');
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            if (val === '*' || item.innerHTML.indexOf(val) > -1) {
                item.className = item.className.replace(/ hidden/g, '');
                const itemCount = parseInt($('td.count', item)[0].innerHTML);

                if (!isNaN(itemCount)) {
                    count += itemCount;
                }

            } else if (item.className.indexOf(' hidden') === -1) {
                item.className += ' hidden';

            }
        }

        $('#total_count').text(count);
    }

})(window);