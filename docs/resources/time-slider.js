// Time Slider for OpenLayers Map - Filters by 'data' attribute
(function() {
    'use strict';
    
    // Wait for the map and layers to be fully loaded
    window.addEventListener('load', function() {
        initTimeSlider();
    });
    
    function initTimeSlider() {
        // Get references to the layer and its source
        var layer = lyr_PredazioniTicinoCasistica_4;
        var source = layer.getSource();
        
        if (!source) {
            console.error('Layer source not found');
            return;
        }
        
        // Get all features
        var allFeatures = source.getFeatures();
        
        if (allFeatures.length === 0) {
            console.warn('No features found in layer');
            return;
        }
        
        // Extract and sort all dates
        var dates = [];
        allFeatures.forEach(function(feature) {
            var dateStr = feature.get('data');
            if (dateStr) {
                var date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                    dates.push(date);
                }
            }
        });
        
        if (dates.length === 0) {
            console.warn('No valid dates found in features');
            return;
        }
        
        dates.sort(function(a, b) { return a - b; });
        
        var minDate = dates[0];
        var maxDate = dates[dates.length - 1];
        var minTimestamp = minDate.getTime();
        var maxTimestamp = maxDate.getTime();
        
        // Get UI elements
        var sliderElement = document.getElementById('time-slider');
        var sliderContainer = document.getElementById('time-slider-container');
        var toggleButton = document.getElementById('toggle-slider');
        var startDateDisplay = document.getElementById('start-date');
        var endDateDisplay = document.getElementById('end-date');
        var dateInputStart = document.getElementById('date-input-start');
        var dateInputEnd = document.getElementById('date-input-end');
        var resetButton = document.getElementById('reset-time');
        var showAllButton = document.getElementById('show-all');
        
        if (!sliderElement) {
            console.error('Slider element not found');
            return;
        }
        
        // Check if noUiSlider is available
        if (typeof noUiSlider === 'undefined') {
            console.error('noUiSlider library not found');
            return;
        }
        
        // Toggle slider visibility
        if (toggleButton) {
            toggleButton.addEventListener('click', function() {
                sliderContainer.classList.toggle('collapsed');
            });
        }
        
        // Make slider draggable
        makeDraggable(sliderContainer, document.querySelector('.slider-header'));
        
        // Check if noUiSlider is available
        if (typeof noUiSlider === 'undefined') {
            console.error('noUiSlider library not found');
            return;
        }
        
        // Format date for display
        function formatDate(date) {
            var day = ('0' + date.getDate()).slice(-2);
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var year = date.getFullYear();
            return day + '/' + month + '/' + year;
        }
        
        // Format date for input field (YYYY-MM-DD)
        function formatDateForInput(date) {
            var day = ('0' + date.getDate()).slice(-2);
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var year = date.getFullYear();
            return year + '-' + month + '-' + day;
        }
        
        // Parse date from input field
        function parseDateFromInput(dateString) {
            var parts = dateString.split('-');
            if (parts.length === 3) {
                return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
            return null;
        }
        
        // Filter features based on date range
        function filterFeaturesByDateRange(startDate, endDate) {
            var filteredFeatures = [];
            
            allFeatures.forEach(function(feature) {
                var dateStr = feature.get('data');
                if (dateStr) {
                    var featureDate = new Date(dateStr);
                    if (!isNaN(featureDate.getTime()) && 
                        featureDate >= startDate && 
                        featureDate <= endDate) {
                        filteredFeatures.push(feature);
                    }
                }
            });
            
            // Clear the source and add filtered features
            source.clear();
            source.addFeatures(filteredFeatures);
            
            // Also update the heatmap layer if it exists
            if (typeof lyr_PredazioniTicinoHeatmap_3 !== 'undefined') {
                var heatmapSource = lyr_PredazioniTicinoHeatmap_3.getSource();
                if (heatmapSource) {
                    heatmapSource.clear();
                    heatmapSource.addFeatures(filteredFeatures);
                }
            }
        }
        
        // Create the noUiSlider
        noUiSlider.create(sliderElement, {
            start: [minTimestamp, maxTimestamp],
            connect: true,
            range: {
                'min': minTimestamp,
                'max': maxTimestamp
            },
            step: 86400000, // 1 day in milliseconds
            behaviour: 'drag',
            tooltips: false
        });
        
        // Initialize date inputs with min and max values
        dateInputStart.min = formatDateForInput(minDate);
        dateInputStart.max = formatDateForInput(maxDate);
        dateInputStart.value = formatDateForInput(minDate);
        
        dateInputEnd.min = formatDateForInput(minDate);
        dateInputEnd.max = formatDateForInput(maxDate);
        dateInputEnd.value = formatDateForInput(maxDate);
        
        // Update display and filter on slider change
        sliderElement.noUiSlider.on('update', function(values, handle) {
            var startDate = new Date(parseInt(values[0]));
            var endDate = new Date(parseInt(values[1]));
            
            startDateDisplay.textContent = formatDate(startDate);
            endDateDisplay.textContent = formatDate(endDate);
            
            // Update date inputs
            dateInputStart.value = formatDateForInput(startDate);
            dateInputEnd.value = formatDateForInput(endDate);
            
            filterFeaturesByDateRange(startDate, endDate);
        });
        
        // Update slider when date input changes
        dateInputStart.addEventListener('change', function() {
            var selectedDate = parseDateFromInput(this.value);
            if (selectedDate) {
                var timestamp = selectedDate.getTime();
                var currentValues = sliderElement.noUiSlider.get();
                var endTimestamp = parseInt(currentValues[1]);
                
                // Ensure start is not after end
                if (timestamp > endTimestamp) {
                    timestamp = endTimestamp;
                    this.value = formatDateForInput(new Date(timestamp));
                }
                
                sliderElement.noUiSlider.set([timestamp, endTimestamp]);
            }
        });
        
        dateInputEnd.addEventListener('change', function() {
            var selectedDate = parseDateFromInput(this.value);
            if (selectedDate) {
                var timestamp = selectedDate.getTime();
                var currentValues = sliderElement.noUiSlider.get();
                var startTimestamp = parseInt(currentValues[0]);
                
                // Ensure end is not before start
                if (timestamp < startTimestamp) {
                    timestamp = startTimestamp;
                    this.value = formatDateForInput(new Date(timestamp));
                }
                
                sliderElement.noUiSlider.set([startTimestamp, timestamp]);
            }
        });
        
        // Reset function
        function resetSlider() {
            sliderElement.noUiSlider.set([minTimestamp, maxTimestamp]);
            dateInputStart.value = formatDateForInput(minDate);
            dateInputEnd.value = formatDateForInput(maxDate);
            source.clear();
            source.addFeatures(allFeatures);
            
            // Also reset heatmap
            if (typeof lyr_PredazioniTicinoHeatmap_3 !== 'undefined') {
                var heatmapSource = lyr_PredazioniTicinoHeatmap_3.getSource();
                if (heatmapSource) {
                    heatmapSource.clear();
                    heatmapSource.addFeatures(allFeatures);
                }
            }
        }
        
        // Reset button
        resetButton.addEventListener('click', resetSlider);
        
        // Show all button
        showAllButton.addEventListener('click', resetSlider);
        
        console.log('Time slider initialized');
        console.log('Date range: ' + formatDate(minDate) + ' to ' + formatDate(maxDate));
        console.log('Total features: ' + allFeatures.length);
    }
    
    // Generic draggable function for containers
    function makeDraggable(container, header) {
        var isDragging = false;
        var currentX;
        var currentY;
        var initialX;
        var initialY;
        var xOffset = 0;
        var yOffset = 0;
        
        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        function dragStart(e) {
            // Don't drag if clicking on buttons
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                
                setTranslate(currentX, currentY, container);
            }
        }
        
        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
        
        function setTranslate(xPos, yPos, el) {
            // Get the current bottom/left/right/top values
            var computedStyle = window.getComputedStyle(el);
            var bottom = computedStyle.bottom;
            var left = computedStyle.left;
            var right = computedStyle.right;
            var top = computedStyle.top;
            
            // Remove transform-based positioning and use absolute positioning
            if (el.style.transform.includes('translateX')) {
                el.style.left = '50%';
                el.style.marginLeft = (-el.offsetWidth / 2) + 'px';
                el.style.transform = 'none';
            }
            
            // Apply drag offset
            el.style.transform = 'translate(' + xPos + 'px, ' + yPos + 'px)';
        }
    }
    
    // Export for use in other modules
    window.makeDraggable = makeDraggable;
})();
