// Charts for Predazioni Data using ECharts
(function() {
    'use strict';
    
    // Wait for the map and layers to be fully loaded
    window.addEventListener('load', function() {
        initCharts();
    });
    
    function initCharts() {
        // Get references to the layer and its source
        var layer = lyr_PredazioniTicinoCasistica_4;
        var source = layer.getSource();
        
        if (!source) {
            console.error('Layer source not found for charts');
            return;
        }
        
        // Get all features
        var allFeatures = source.getFeatures();
        
        if (allFeatures.length === 0) {
            console.warn('No features found for charts');
            return;
        }
        
        // Get UI elements
        var chartsContainer = document.getElementById('charts-container');
        var toggleButton = document.getElementById('toggle-charts');
        var chartTypeSelector = document.getElementById('chart-type');
        var chartDisplay = document.getElementById('chart-display');
        
        if (!chartDisplay || !chartTypeSelector) {
            console.error('Chart elements not found');
            return;
        }
        
        // Check if ECharts is available
        if (typeof echarts === 'undefined') {
            console.error('ECharts library not found');
            return;
        }
        
        // Initialize ECharts instance
        var myChart = echarts.init(chartDisplay);
        
        // Toggle charts visibility
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                chartsContainer.classList.toggle('collapsed');
                // Resize chart when expanded
                if (!chartsContainer.classList.contains('collapsed')) {
                    setTimeout(function() {
                        myChart.resize();
                    }, 300);
                }
            });
        }
        
        // Make charts container draggable
        if (typeof window.makeDraggable === 'function') {
            window.makeDraggable(chartsContainer, document.querySelector('.charts-header'));
        }
        
        // Process data from features
        function processData() {
            var data = {
                dates: [],
                species: {},
                locations: {},
                monthlyTotals: {}
            };
            
            allFeatures.forEach(function(feature) {
                var dateStr = feature.get('data');
                var species = feature.get('specie_predate') || 'Non specificato';
                var location = feature.get('luogo') || 'Non specificato';
                var count = feature.get('numero_predati') || 0;
                
                if (dateStr) {
                    var date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        // Store for species timeline
                        var dateKey = date.toISOString().split('T')[0];
                        if (!data.species[species]) {
                            data.species[species] = {};
                        }
                        if (!data.species[species][dateKey]) {
                            data.species[species][dateKey] = 0;
                        }
                        data.species[species][dateKey] += count;
                        
                        // Store for monthly totals
                        var monthKey = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
                        if (!data.monthlyTotals[monthKey]) {
                            data.monthlyTotals[monthKey] = 0;
                        }
                        data.monthlyTotals[monthKey] += count;
                        
                        // Store for location stats
                        if (!data.locations[location]) {
                            data.locations[location] = 0;
                        }
                        data.locations[location] += count;
                    }
                }
            });
            
            return data;
        }
        
        var processedData = processData();
        
        // Chart: Species Timeline (Line Race style)
        function createSpeciesTimelineChart() {
            var speciesNames = Object.keys(processedData.species);
            var allDates = new Set();
            
            // Collect all unique dates
            speciesNames.forEach(function(species) {
                Object.keys(processedData.species[species]).forEach(function(date) {
                    allDates.add(date);
                });
            });
            
            var sortedDates = Array.from(allDates).sort();
            var series = [];
            
            // Create series for each species
            speciesNames.forEach(function(species) {
                var data = [];
                var cumulative = 0;
                
                sortedDates.forEach(function(date) {
                    var count = processedData.species[species][date] || 0;
                    cumulative += count;
                    data.push([date, cumulative]);
                });
                
                series.push({
                    name: species,
                    type: 'line',
                    data: data,
                    smooth: true,
                    emphasis: {
                        focus: 'series'
                    }
                });
            });
            
            var option = {
                title: {
                    text: 'Evoluzione predazioni per specie',
                    left: 'center',
                    textStyle: {
                        color: '#001144',
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '8%',
                    top: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'time',
                    boundaryGap: false,
                    axisLabel: {
                        color: '#001144',
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Numero cumulativo',
                    axisLabel: {
                        color: '#001144',
                        fontSize: 10
                    },
                    nameTextStyle: {
                        color: '#001144'
                    }
                },
                series: series
            };
            
            myChart.setOption(option);
        }
        
        // Chart: Monthly Totals (Bar chart)
        function createMonthlyTotalsChart() {
            var months = Object.keys(processedData.monthlyTotals).sort();
            var values = months.map(function(month) {
                return processedData.monthlyTotals[month];
            });
            
            var option = {
                title: {
                    text: 'Predazioni per mese',
                    left: 'center',
                    textStyle: {
                        color: '#001144',
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    top: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: months,
                    axisLabel: {
                        color: '#001144',
                        fontSize: 10,
                        rotate: 45
                    }
                },
                yAxis: {
                    type: 'value',
                    name: 'Numero animali',
                    axisLabel: {
                        color: '#001144',
                        fontSize: 10
                    },
                    nameTextStyle: {
                        color: '#001144'
                    }
                },
                series: [{
                    data: values,
                    type: 'bar',
                    itemStyle: {
                        color: '#80b2e0'
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#001144'
                        }
                    }
                }]
            };
            
            myChart.setOption(option);
        }
        
        // Chart: Species Distribution (Pie chart)
        function createSpeciesDistributionChart() {
            var speciesData = [];
            
            Object.keys(processedData.species).forEach(function(species) {
                var total = 0;
                Object.keys(processedData.species[species]).forEach(function(date) {
                    total += processedData.species[species][date];
                });
                speciesData.push({
                    name: species,
                    value: total
                });
            });
            
            // Sort by value descending
            speciesData.sort(function(a, b) {
                return b.value - a.value;
            });
            
            var option = {
                title: {
                    text: 'Distribuzione per specie',
                    left: 'center',
                    textStyle: {
                        color: '#001144',
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                series: [{
                    name: 'Specie',
                    type: 'pie',
                    radius: '60%',
                    center: ['50%', '55%'],
                    data: speciesData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        fontSize: 10,
                        color: '#001144'
                    }
                }]
            };
            
            myChart.setOption(option);
        }
        
        // Chart: Location Stats (Horizontal bar chart)
        function createLocationStatsChart() {
            var locations = Object.keys(processedData.locations);
            var locationData = locations.map(function(loc) {
                return {
                    name: loc,
                    value: processedData.locations[loc]
                };
            });
            
            // Sort by value and take top 15
            locationData.sort(function(a, b) {
                return b.value - a.value;
            });
            locationData = locationData.slice(0, 15);
            
            var option = {
                title: {
                    text: 'Top 15 località per numero predazioni',
                    left: 'center',
                    textStyle: {
                        color: '#001144',
                        fontSize: 14
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    top: '15%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    axisLabel: {
                        color: '#001144',
                        fontSize: 10
                    }
                },
                yAxis: {
                    type: 'category',
                    data: locationData.map(function(d) { return d.name; }),
                    axisLabel: {
                        color: '#001144',
                        fontSize: 10
                    }
                },
                series: [{
                    data: locationData.map(function(d) { return d.value; }),
                    type: 'bar',
                    itemStyle: {
                        color: '#9ac2e8'
                    },
                    emphasis: {
                        itemStyle: {
                            color: '#001144'
                        }
                    }
                }]
            };
            
            myChart.setOption(option);
        }
        
        // Chart type selector event
        chartTypeSelector.addEventListener('change', function() {
            var chartType = this.value;
            
            switch(chartType) {
                case 'species-timeline':
                    createSpeciesTimelineChart();
                    break;
                case 'monthly-totals':
                    createMonthlyTotalsChart();
                    break;
                case 'species-distribution':
                    createSpeciesDistributionChart();
                    break;
                case 'location-stats':
                    createLocationStatsChart();
                    break;
            }
        });
        
        // Initialize with default chart
        createSpeciesTimelineChart();
        
        // Resize chart on window resize
        window.addEventListener('resize', function() {
            if (!chartsContainer.classList.contains('collapsed')) {
                myChart.resize();
            }
        });
        
        console.log('Charts initialized');
        console.log('Processed data:', processedData);
    }
})();
