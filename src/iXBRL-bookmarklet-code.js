let xbrlTagsNonNumericArray = Array.from(document.getElementsByTagName('ix:nonnumeric'));
let xbrlTagsNumericArray = Array.from(document.getElementsByTagName('ix:nonfraction'));
let xbrlTagsContinuationArray = Array.from(document.getElementsByTagName('ix:continuation'));
let xbrlTagsArray = xbrlTagsNonNumericArray.concat(xbrlTagsNumericArray).concat(xbrlTagsContinuationArray);

/* Create HTML tables */
addCSS();
createHTMLTableHiddenElements();
searchForHiddenTags();
checkHiddenTags();
createHTMLTable();

/* Add event listener to log value that calls the function (has to be annonymous fx that calls the fx with parameters) */
xbrlTagsArray.forEach(xbrlTag => findParentElement(xbrlTag).addEventListener('mouseenter', function(){fillAndMoveTable(xbrlTag)}));
xbrlTagsArray.forEach(xbrlTag => findParentElement(xbrlTag).addEventListener('mouseleave', function(){hideTable()}));

/* function parentElement */
function findParentElement(obj){
    let parentEl = obj.parentElement;
    /* check ONLY one more level for TD, there are cases with out any TD */
    if (parentEl.parentElement.nodeName == "TD") {
        return parentEl.parentElement
    } else { 
        return parentEl
    };
};

/* function that return xbrl tag name */
function tagName(obj) {
   return obj.getAttribute('name');
};

/* function to look for period */
function getPeriods(obj) {
    /* Get contextref of this element */
    let contextID = obj.getAttribute(['contextref']);
    /* search for xbrl-context element */ 
    let contextElement = document.getElementById(contextID);
    /* get period element */
    let periodElement = contextElement.getElementsByTagName('xbrli:period')[0];
    /* get possible elements */
    let startDate = periodElement.getElementsByTagName('xbrli:startDate')[0];
    let endDate = periodElement.getElementsByTagName('xbrli:endDate')[0];
    let instantDate = periodElement.getElementsByTagName('xbrli:instant')[0];
    /* return values */
    if (instantDate) {
        return instantDate.innerHTML
    } else {
        return startDate.innerHTML + " - " + endDate.innerHTML
    };
};

/*function to look for the first tag of a Continuation tag */
function getMainTag(obj) {
    if (obj.nodeName == "IX:CONTINUATION") {
        /* get the id of the current tag */
        let currentTagId = obj.id;
        /* get previous element */
        let previousElement = document.querySelector('[continuedAt='+currentTagId+']');
        /* Is the previous element another continuation tag ? */
        return getMainTag(previousElement);
    } else {
        return obj;    
    };
};

/* function to check the dimensions */
function checkDimensions(obj) {
    /* Get contextref of this element */
    let contextID = obj.getAttribute(['contextref']);
    /* Search for element with that id */
    let contextElement = document.getElementById(contextID);
    /* get scenario or segment element */
    let scenarioElement = contextElement.getElementsByTagName('xbrli:scenario')[0];
    let segmentElement = contextElement.getElementsByTagName('xbrli:segment')[0];
    /* check scenario element */
    if (scenarioElement !== undefined) {
        scenarioArray = Array.from(scenarioElement.children);
    } else {
        scenarioArray = new Array();
    }
    /* check segment element */
    if (segmentElement !== undefined) {
        segmentArray = Array.from(segmentElement.children);
    } else {
        segmentArray = new Array();
    }
    /* dimensions Array */
    let dimensionsArray = scenarioArray.concat(segmentArray);
    let dimensionsObjArray = new Array();
    /* check if Array is not empty and loop */
    if ( dimensionsArray.length ) {
        for ( var i = 0; i < dimensionsArray.length; i++) {
            /* get scenario-segment first child element */
            let dimensionElement = dimensionsArray[i];
            let dimension = dimensionElement.getAttribute(['dimension']);
            let content;
            /* check tag */
            if (dimensionElement.nodeName == "XBRLDI:EXPLICITMEMBER") {
                /* EXPLICIT MEMBER */
                content = dimensionElement.innerHTML;
            } else {
                /* TYPED MEMBER:  one level deeper */
                content = dimensionElement.firstElementChild.innerHTML;
            }
            /* append to array */
            dimensionsObjArray.push({ 
                "dimensionName": dimension,
                "dimensionContent": content,
            });
        }
    };
    /* return array with dimensions or empty */
    return dimensionsObjArray;
};

/* function to get scheme and identifier */
function getSchemeAndIdentifier(obj){
    /* Get contextref of this element */
    let contextID = obj.getAttribute(['contextref']);
    /* Search for element with that id */
    let contextElement = document.getElementById(contextID);
    /* get scenario element */
    let identifierElement = contextElement.getElementsByTagName('xbrli:identifier')[0];
    /* check identifierElement */
    let scheme = identifierElement.getAttribute(['scheme']);
    let identifierContent = identifierElement.innerHTML;
    return {
        "scheme": scheme, 
        "identifier": identifierContent,
    };
};

/* Create CSS rules */
function addCSS() {
    let style = `
    div.xbrl-table { 
        background-color: white; 
        border-radius: 15px; 
        padding: 10px; 
        font-family: Lato, sans-serif; 
        font-size: 12px; 
        width: 400px; 
        box-shadow: 0 10px 16px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19) ;
    }
    div.xbrl-table th.xbrl-hover-title { 
        font-size: 15px; 
        color: #20516A; 
        background-color: white; 
        text-align: left; 
        word-break: break-word; 
        border-bottom: 1px solid #F2F2F2; 
    }
    div.xbrl-table td.xbrl-hover-content { 
        font-size: 12px !important; 
        color: black !important; 
        background-color: white !important; 
        text-align: left; 
        word-break: break-word; 
    }
    .show-table { 
        opacity: 1; 
        transition: opacity 1s; 
    }
    .hide-table { 
        opacity: 0; 
        transition: opacity 1s; 
    }`;
    let styleElement = document.createElement("style");
    styleElement.innerText = style;
    document.head.appendChild(styleElement);
};

/* Create table (HTML and CSS) */
function createHTMLTable() {
    var divXbrlTable = document.createElement("div");

    divXbrlTable.innerHTML = `
        <div class="xbrl-table" id="xbrl-hover-table">
            <table style="width: 100%; margin-bottom: 0px">
                <tbody>
                    <tr>
                        <th class="xbrl-hover-title" id="xbrl-name-title">
                            Element name
                        </th>
                    </tr>
                    <tr>
                        <td class="xbrl-hover-content" id="xbrl-name-content">  
                        </td>
                    </tr>
                    <tr>
                        <th class="xbrl-hover-title" id="xbrl-dimension-title-1">
                            Dimension
                        </th>
                    </tr>
                    <tr>
                        <td class="xbrl-hover-content" id="xbrl-dimension-name-1">
                        </td>
                    </tr>
                    <tr>
                        <td class="xbrl-hover-content" id="xbrl-dimension-content-1">
                        </td>
                    </tr>
                    <tr>
                        <th class="xbrl-hover-title" id="xbrl-dimension-title-2">
                            Dimension
                        </th>
                    </tr>
                    <tr>
                        <td class="xbrl-hover-content" id="xbrl-dimension-name-2">
                        </td>
                    </tr>
                    <tr>
                        <td class="xbrl-hover-content" id="xbrl-dimension-content-2">
                        </td>
                    </tr>
                    <tr>
                        <th class="xbrl-hover-title" id="xbrl-period-title">
                            Period
                        </th>
                    </tr>
                    <tr>
                        <td class="xbrl-hover-content" id="xbrl-period-content">
                        </td>
                    </tr>
                    <tr>
                        <th class="xbrl-hover-title" id="xbrl-entity-title">
                            Entity
                        </th>
                    </tr>
                    <tr>
                        <td class="xbrl-hover-content" id="xbrl-scheme-content">
                        </td>
                    </tr>
                    <tr>
                        <td class="xbrl-hover-content" id="xbrl-identifier-content">
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>`;
    document.body.appendChild(divXbrlTable);
    /* Starting point: hidden */
    hideTable();
};

/* FILL TABLE */
function fillTableContent(obj) {
    var xbrlTagField = document.getElementById('xbrl-name-content');
    xbrlTagField.innerHTML = tagName(obj);
    var periodField = document.getElementById('xbrl-period-content');
    periodField.innerHTML = getPeriods(obj);
    var schemeField = document.getElementById('xbrl-scheme-content');
    var identifierField = document.getElementById('xbrl-identifier-content');
    schemeField.innerHTML = "<b>Scheme: </b>"+getSchemeAndIdentifier(obj).scheme;
    identifierField.innerHTML = "<b>Identifier: </b>"+getSchemeAndIdentifier(obj).identifier;
    var objDimension = checkDimensions(obj);
    /* dimension 1 */
    var dimensionTitleField = document.getElementById('xbrl-dimension-title-1');
    var dimensionNameField = document.getElementById('xbrl-dimension-name-1');
    var dimensionContentField = document.getElementById('xbrl-dimension-content-1');
    if (objDimension[0]) {
        /* show section */
        dimensionTitleField.parentElement.style.display = 'block';
        dimensionNameField.parentElement.style.display = 'block';
        dimensionContentField.parentElement.style.display = 'block';
        dimensionNameField.innerHTML = "<b>Name: </b>"+objDimension[0].dimensionName;
        dimensionContentField.innerHTML = "<b>Content: </b>"+objDimension[0].dimensionContent;
    } else {
        /* hide section */
        dimensionTitleField.parentElement.style.display = 'none';
        dimensionNameField.parentElement.style.display = 'none';
        dimensionContentField.parentElement.style.display = 'none';
    };
    /* dimension 2 */
    var dimensionTitleField = document.getElementById('xbrl-dimension-title-2');
    var dimensionNameField = document.getElementById('xbrl-dimension-name-2');
    var dimensionContentField = document.getElementById('xbrl-dimension-content-2');
    if (objDimension[1]) {
        /* show section */
        dimensionTitleField.parentElement.style.display = 'block';
        dimensionNameField.parentElement.style.display = 'block';
        dimensionContentField.parentElement.style.display = 'block';
        dimensionNameField.innerHTML = "<b>Name: </b>"+objDimension[1].dimensionName;
        dimensionContentField.innerHTML = "<b>Member: </b>"+objDimension[1].dimensionContent;
    } else {
        /* hide section */
        dimensionTitleField.parentElement.style.display = 'none';
        dimensionNameField.parentElement.style.display = 'none';
        dimensionContentField.parentElement.style.display = 'none';
    };
};

/* POSITION TABLE */
function placeTable(x_pos, y_pos) {
  var divXBRL = document.getElementById('xbrl-hover-table');
  divXBRL.style.position = "absolute";
  divXBRL.style.zIndex = 900;
  divXBRL.style.top = y_pos+'px';
  divXBRL.style.left = x_pos+'px';
};

/* Return coordinates to position table relative to the element targeted. Position left if there is enough space, otherwise position right */
function getCoordsObj(obj) {
    let rect = obj.getBoundingClientRect();
    let top = rect.top + window.pageYOffset;
    let bottom = rect.bottom + window.pageYOffset;
    let left = rect.left + window.pageXOffset;
    let right = rect.right + window.pageXOffset;
    let full_width = document.documentElement.clientWidth;
    let height = top-bottom;
    let y_pos = top+(height/2);
    let x_pos;
    if (right+450 < full_width){
        x_pos = right+50;
    } else {
        x_pos = left-450;
    }
    return {
        x_pos: x_pos,
        y_pos: y_pos,
    };
};

/* TABLE: Fill & Position */
function fillAndMoveTable(obj){
    /* position table */
    coordinates = getCoordsObj(findParentElement(obj));
    placeTable(coordinates.x_pos, coordinates.y_pos);
    /* get the element from which take the info */
    xbralTagElement = getMainTag(obj);
    /* populate table with information */
    fillTableContent(xbralTagElement);
    /* position table */
    showTable();
};

function showTable() {
    var divXBRL = document.getElementById('xbrl-hover-table');
    divXBRL.classList.add('show-table');
    divXBRL.classList.remove('hide-table');
};

function hideTable() {
    var divXBRL = document.getElementById('xbrl-hover-table');
    divXBRL.classList.add('hide-table');
    divXBRL.classList.remove('show-table');
};


/* Search for Hidden Tags */
function searchForHiddenTags() {
    const hiddenTags = document.getElementsByTagName('IX:HIDDEN')[0].children;
    for ( tag of hiddenTags ) {
        createRowHiddenElements(tagName(tag), tag.innerHTML, getPeriods(tag));
        var hiddenDimensions = checkDimensions(tag);
        if (hiddenDimensions.length) {
            for ( dimension of hiddenDimensions ) {
                createRowHiddenElements(`Dimension: ${dimension.dimensionName}`, dimension.dimensionContent, getPeriods(tag), true);
            };
        };
    };
};

function checkHiddenTags() {
    var hiddenRows = document.getElementById('hidden-tags-tbody').children;
    var hiddenTable = document.getElementById('xbrl-hidden-table');
    if (!hiddenRows.length){
        hiddenTable.classList.add('hide-table')
    };
};

function createHTMLTableHiddenElements() {
    var divHiddenElementsTable = document.createElement("div");
    divHiddenElementsTable.innerHTML = `
        <div class="xbrl-table" id="xbrl-hidden-table" style="width: 210mm; margin: 10mm auto;">
            <table style="width: 100%; margin: 20px; padding-right: 40px;">
                <thead>
                    <tr>
                        <th class="xbrl-hover-title" style="text-align: center;" colspan="3">
                            XBRL - Hidden elements
                        </th>
                    </tr>
                    <tr>
                        <th class="xbrl-hover-title" style="width: 40%; text-align: center;">
                            Element name
                        </th>
                        <th class="xbrl-hover-title" style="width: 40%; text-align: center;">
                            Content
                        </th>
                        <th class="xbrl-hover-title" style="width: 20%; text-align: center;">
                            Period
                        </th>
                    </tr>
                </head>
                <tbody id="hidden-tags-tbody">
                </tbody>
            </table>`;
    document.body.appendChild(divHiddenElementsTable);
};

function createRowHiddenElements(name, content, period, isDimension = false) {
    var tbodyElement = document.getElementById('hidden-tags-tbody');
    var trHiddenElement = document.createElement("tr");
    trHiddenElement.innerHTML = `
    <td class="xbrl-hover-content" style="width: 40%; padding: 3px;">
        ${name}
    </td>
    <td class="xbrl-hover-content" style="width: 40%; padding: 3px;">
        ${content}
    </td>
    <td class="xbrl-hover-content" style="width: 20%; padding: 3px;">
        ${period}
    </td>`;
    if (isDimension) {
        var tds = trHiddenElement.getElementsByTagName('td');
        tds[0].style.textIndent = "15px";
        tds[0].style.fontStyle = "italic";
    };
    tbodyElement.appendChild(trHiddenElement);
};