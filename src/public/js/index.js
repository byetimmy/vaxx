(function (win) {

    function Filter(id, val, label, containerId, prop, isMulti) {
        this.id = id;
        this.label = label;
        this.val = val
        this.containerId = containerId;
        this.prop = prop;
        this.isMulti = !!isMulti;

        this.pending = [];

        const this_ = this;

        this.init = () => {

            //create the html elements
            if (!this.el()) {
                const container = document.getElementById(this.containerId);
                const sel = document.createElement('select');
                sel.id = this.id;
                sel.name = this.id;
                sel.className = 'filter';

                sel.onchange = function() {
                    this_.val = this[this.selectedIndex].value;
                    filterResults();
                };

                const opt = document.createElement('option');
                opt.value = val;
                opt.innerHTML = this.label;
                sel.appendChild(opt);
                container.appendChild(sel);
            }

        };

        this.el = () => {
            return document.getElementById(this.id);
        };

        this.resetOptions = () => {
            this.pending = [];
        };

        this.addOption = (item) => {
            let val = item[this.prop];
            if (val) {
                if (this.isMulti) {
                    val = val.split(',');
                } else {
                    val = [val];
                }

                for (let i = 0; i < val.length; i++) {
                    val[i] = val[i].trim();
                    if (this.pending.indexOf(val[i]) === -1) {
                        this.pending.push(val[i]);
                    }
                }
            }

        }

        this.render = () => {
            const el = this.el();

            let existing = [];

            //if we have options that aren't pending, remove them
            for (let i = el.options.length - 1; i >= 1; i--){
                const option = el.options[i];
                if (this.pending.indexOf(option.value) === -1) {
                    if (el.selectedIndex === i) {
                        el.selectedIndex = 0;
                    }
                    el.remove(i);
                } else {
                    existing.push(option.value);
                }
            }


            for (let i = 0; i < this.pending.length; i++) {
                const optVal = this.pending[i];
                if (existing.indexOf(optVal) === -1) {
                    const opt = document.createElement('option');

                    opt.value = optVal;
                    opt.innerHTML = optVal;
                    el.appendChild(opt);
                }
            }

            //this.pending = [];

        };

        this.init();

    }

    function addOptionToFilters(itm) {
        for (let f in filters) {
            const filter = filters[f];
            filter.addOption(itm);
        }
    }

    function resetFilters() {
        for (let f in filters) {
            const filter = filters[f];
            filter.resetOptions();
        }
    }

    function renderFilters() {
        for (let f in filters) {
            const filter = filters[f];
            filter.render();
        }

        filterResults();
    }

    function filterResults() {

        const items = $('div.item');
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            let showItem = true;

            for (let f in filters) {
                if (showItem) {
                    const filter = filters[f];
                    const el = filter.el();

                    const filterValue = el[el.selectedIndex].value;
                    if (filterValue !== '*') {
                        const dataProp = $('td.' + filter.prop, item)[0].innerHTML;
                        if (dataProp.indexOf(filterValue) === -1) {
                            showItem = false;
                        }
                    }
                }
            }

            if (showItem) {
                item.className = item.className.replace(/ hidden/g, '');
                const itemCount = parseInt($('td.count', item)[0].innerHTML, 10);

                if (!isNaN(itemCount)) {
                    count += itemCount;
                }

            } else if (item.className.indexOf(' hidden') === -1) {
                item.className += ' hidden';

            }

        }

        $('#total_count').text(count);
    }

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

    let filters = {};
    win.init = function() {
        filters = {
            'offered': new Filter('f_offered', '*', '-Filter by Vaxx-', 'filters', 'offered', true),
            'date_avail': new Filter('f_date', '*', '-Filter by Date-', 'filters', 'date_avail', false),
            'city': new Filter('f_city', '*', '-Filter by City-', 'filters', 'city', false)
        };

        main();
    };

    function main() {
        getData(function (results, error) {
            try {
                if (error) {
                    console.error('ajax error: ', error);

                } else if (results && results.config) {
                    const items = results.data.items;

                    const config = results.config;

                    if (JSON.stringify(items) !== prevItems) {
                        prevItems = JSON.stringify(items);

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

                        //reset the filter definitions
                        resetFilters();

                        for (let i = 0; i < items.length; i++) {
                            const itm = items[i];
                    
                            let tmp = template;
                            for (let prop in itm) {
                                tmp = tmp.replace(new RegExp (`\{${prop}\}`, 'g'), itm[prop]);
                            }

                            //update the filter definitions
                            addOptionToFilters(itm);

                            newItems.push(tmp);
                        }

                        $('#items').html(newItems.join(''));
                    }

                    refreshInterval = config.refresh;

                    renderFilters();
                }

            } catch (e){
                console.error('client error: ', e);
            }

            setTimeout(main, refreshInterval * 1000);

        });

    }


    win.xfilterResults = function() {
/*
        const filter_vaxx = $('#filter_vaxx')[0];
        const filter_date = $('#filter_date')[0];
        const filter_loc = $('#filter_loc')[0];

        const val_vaxx = filter_vaxx[filter_vaxx.selectedIndex].value;
        const val_date = filter_date[filter_date.selectedIndex].value;
        const val_loc = filter_loc[filter_loc.selectedIndex].value;

        const items = $('div.item');
        let count = 0;

        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            const data_vaxx = $('td.vaxx', item)[0].innerHTML;
            const data_date = $('td.date', item)[0].innerHTML;
            const data_loc = $('td.loc', item)[0].innerHTML;

            const show_vaxx = (val_vaxx === '*' || data_vaxx.indexOf(val_vaxx) > -1);
            const show_date = (val_date === '*' || data_date.indexOf(val_date) > -1);
            const show_loc = (val_loc === '*' || data_loc.indexOf(val_loc) > -1);

            if (show_vaxx && show_date && show_loc) {
                item.className = item.className.replace(/ hidden/g, '');
                const itemCount = parseInt($('td.count', item)[0].innerHTML, 10);

                if (!isNaN(itemCount)) {
                    count += itemCount;
                }

            } else if (item.className.indexOf(' hidden') === -1) {
                item.className += ' hidden';

            }

        }

        $('#total_count').text(count);
        */
    }

})(window);