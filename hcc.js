google.load('visualization', '1.0', {'packages':['corechart']});

INCREMENT = 10;

currentRow = 0;
sample1 = {name: 'Sample 1', premium: 47.31, payPeriod: 26, deductible: 2500, percentage: 25, oopMax: 5000, totalPremium: 0}
sample2 = {name: 'Sample 2', premium: 90.23, payPeriod: 26, deductible: 750, percentage: 40, oopMax: 5000, totalPremium: 0}
empty = {name: '', premium: '', payPeriod: '', deductible: '', percentage: '', oopMax: '', totalPremium: ''}

google.setOnLoadCallback(loadPage);

function loadPage()
{
    drawChart([sample1, sample2]);
    fillRow(sample1);
    fillRow(sample2);
}

function fillRow(data)
{
    var row = "".concat('<tr>',
                            '<th>$<input type="text" name="name' + currentRow + '" value="' + data.name + '" /></th>',
                            '<th>$<input type="text" name="premium' + currentRow + '" value="' + data.premium + '" /></th>',
                            '<th><input type="text" name="payPeriod' + currentRow + '" value="' + data.payPeriod + '" /></th>',
                            '<th>$<input type="text" name="deductible' + currentRow + '" value="' + data.deductible + '" /></th>',
                            '<th><input type="text" name="percentage' + currentRow + '" value="' + data.percentage + '" />%</th>',
                            '<th>$<input type="text" name="oopMax' + currentRow + '" value="' + data.oopMax + '" /></th>',
                        '</tr>');
    // I hate javascript so much right now for doing ' + currentRow + '
    ++currentRow;
                            
    $('#insurancePlansTable tr:last').after(row);
}



function addRow()
{
    fillRow(empty);
}

function updateChart()
{
    var choices = getChoices();
    console.log(choices);
    drawChart(choices);
}

function getChoices()
{
    var values = {};
    $.each($('#insurancePlansForm').serializeArray(), function(i, field) {
        values[field.name] = field.value;
    });
    
    var choices = []
    for (i = 0; i < currentRow; ++i)
    {
        var cr = i;
        var premium = parseFloat(values['premium'+cr]);
        var payPeriod = parseFloat(values['payPeriod'+cr]);
        var totalPremium = premium * payPeriod;
        
        choices.push({name: values['name'+cr],
                   premium: premium,
                   payPeriod: payPeriod,
                   deductible: parseFloat(values['deductible'+cr]),
                   percentage: parseFloat(values['percentage'+cr]),
                   oopMax: parseFloat(values['oopMax'+cr]),
                   totalPremium: totalPremium});
    }
    return choices;
}


function drawChart(choices)
{
    var maxToShow = 0;

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'Medical Cost');
    for (c = 0; c < choices.length; ++c)
        data.addColumn('number', choices[c].name);
    
    maxToShow = determineMaxCost(choices);
    data.addRows(calculateRows(choices, maxToShow));

    var options = {'title':'What Is Your Max out of Pocket Expenses for the Year?',
                   'width':800,
                   'height':600,
                   'hAxis': {title: 'Medical Costs'},
                   'vAxis': {title: 'Your Costs'},
                   };

    var wrapper = new google.visualization.ChartWrapper({
        chartType: 'LineChart',
        dataTable: data,
        options: options,
        containerId: 'chart_div'
    });
    
    wrapper.draw();
}

function determineMaxCost(choices)
{
    var max = 0
    for (c = 0; c < choices.length; ++c)
    {
        choices[c].totalPremium = choices[c].premium * choices[c].payPeriod;
        var choiceMax = choices[c].totalPremium + choices[c].oopMax;
        if (max < choiceMax)
            max = choiceMax;
    }   
    max = max * 2;
    return max;
}


function calculateRows(choices, maxToShow)
{
    var calc = []
    var currentCost = 0;

    for (i = 0; i < maxToShow; i = i + INCREMENT)
    {
        var row = []
        row.push(i);
    
        for (c = 0; c < choices.length; ++c)
        {
            currentCost = i;
            
            if (currentCost > choices[c].deductible)
            {
                var tempCost = currentCost - choices[c].deductible;
                currentCost = choices[c].deductible + tempCost * (choices[c].percentage / 100.0);
            }
            if (currentCost > choices[c].oopMax)
                currentCost = choices[c].oopMax;

            currentCost += choices[c].totalPremium;
            
            row.push(currentCost);
        }
        calc.push(row);
    }
    return calc;
}