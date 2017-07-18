/**
 * A directed graph editor that allows to add/remove vertices and edges.
 *
 * @author jtravieso
 *
 * References
 * [1] http://bl.ocks.org/rkirsling/5001347  Directed Graph Editor
 * [2] http://bl.ocks.org/mbostock/1138500   Force Directed Tree (Weak Tree)
 * [3] http://stackoverflow.com/a/3690922/2607914 Bind key events to canvas/svg
 * [4] https://gist.github.com/shawnbot/6518285 Zooming within a container.
 * [5] http://stackoverflow.com/a/21991422/2607914 Padding for the graph inner area
 * [6] http://stackoverflow.com/a/19379852/2607914 Responsive D3 Graph
 */

var d3 = require('d3');
var _ = require('lodash');
var Color = require('color');

var ns = {};

var links,      //the graph edges
    nodes,      //the graph vertices
    svg,        //the outer container
    container,  //the inner container, needed for zooming
    force,      //the force layout
    drag_line,  //line that makes it possible to connect 2 nodes
    path,       //the rendered edges
    circle,     //the rendered vertices
    text;       //the vertex label/text

//configurable props
var width,
    height,
    radius,
    editable,
    invertedColors,  /* The have white background, and filled when highlighted */
    logLevel;

//configurable functions
var onNodeSelected;

//based off https://coolors.co/3d5a80-98c1d9-e0fbfc-ee6c4d-293241
//todo make it generic
var colors = {
    'person' : '#6294D0',
    'location' : '#92A47E',
    'movie' : '#858BDB',
    'director' : '#F6A623',
    new: '#3F88C5',
    highlighted : '#FFD700'
};

const zoom = d3.behavior.zoom().scaleExtent([0.7, 15]);

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

var lastNodeId;

var log = {};

log.error = (...args) => {
    if (logLevel >= 1) {
        console.error(...args);
    }
};

log.warn = (...args) => {
    if (logLevel >= 2) {
        console.log(...args);
    }
};

log.info = (...args) => {
    if (logLevel >= 3) {
        console.log(...args);
    }
};

log.debug = (...args) => {
    if (logLevel >= 4) {
        console.log(...args);
    }
};

log.trace = (...args) => {
    if (logLevel >= 5) {
        console.log(...args);
    }
};

ns.create = function(el, props) {

    //uses the full container's dimension, otherwise the props or default value
    width = el.offsetWidth > 0 ? el.offsetWidth: props.width || 860;
    height = el.offsetHeight > 0 ? el.offsetHeight: props.height || 800;

    log.debug("Creating the d3Graph....", "width", width, "height", height);

    colors = props.colors || colors;
    radius = props.radius || 26;
    editable = props.editable || false;
    invertedColors = props.inverted || false;
    logLevel = 4;

    onNodeSelected = props.onNodeSelected;

    //todo d3 smooth zooming https://bl.ocks.org/mbostock/6238040

    svg = d3.select(el)
        .append('svg')
        .attr('oncontextmenu', 'return false;')
        .attr('tabindex', '1')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox','0 0 '+ width + ' ' + height )
        .attr('preserveAspectRatio','xMinYMin');

    container = svg.append("g");

    // set up initial nodes and links
    //  - nodes are known by 'id', not by index in array.
    //  - reflexive edges are indicated on the node (as a bold black circle).
    //  - links are always source < target; edge directions are set by 'left' and 'right'.
    nodes = props.nodes;
    links = props.links;

    _.forEach(links, l => {
        l.source = nodes[l.sourceIndex];
        l.target = nodes[l.targetIndex];
    });

    lastNodeId = nodes.length;

    // init D3 force layout
    force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .size([width, height])
        .linkDistance(150)
        .charge(-500)
        .on('tick', tick);

    // define arrow markers for graph links
    container.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 18)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#E5E5E5');

    container.append('svg:defs').append('svg:marker')
        .attr('id', 'end-arrow-highlighted')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 18)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', "#4A4A4A");

    container.append('svg:defs').append('svg:marker')
        .attr('id', 'start-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', -8)
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#EFEFEF');

    // line displayed when dragging new nodes
    drag_line = container.append('svg:path')
        .attr('class', 'link dragline hidden')
        .attr('d', 'M0,0L0,0');

    // handles to link and node element groups
    path = container.append('svg:g').selectAll('path');
    circle = container.append('svg:g').selectAll('g');

    // update force layout (called automatically each iteration)
    function tick(e) {
        var k = 6 * e.alpha;
        // draw directed edges with proper padding from node centers
        path.attr('d', function(d) {
            d.source.y -= k; d.target.y += k; // Push sources up and targets down to form a weak tree.
            var deltaX = d.target.x - d.source.x,
                deltaY = d.target.y - d.source.y,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                normX = deltaX / dist,
                normY = deltaY / dist,
                sourcePadding = d.left ? 17 : 12,
                targetPadding = d.right ? 17 : 12,
                sourceX = d.source.x + (sourcePadding * normX),
                sourceY = d.source.y + (sourcePadding * normY),
                targetX = d.target.x - (targetPadding * normX),
                targetY = d.target.y - (targetPadding * normY);
            return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
        });

        circle.attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
        });
    }

    // app starts here
    svg.on('mousedown', mousedown)
        .on('mousemove', mousemove)
        .on('mouseup', mouseup)
        .on('keydown', keydown)
        .on('keyup', keyup);
    restart();
};

ns.update = function(el, props, updateFn) {
    updateFn(nodes, links);
    if (el.hasChildNodes()) {
        log.debug('Updating the d3Graph a restart is required');
        restart();
    } else {
        log.debug('Updating the d3Graph... needs to be re-created.');
        ns.create(el, props);
    }
};

ns.updateNode = function(id, updateFn) {
    var node = _.find(nodes, n => n.id === id);
    if (!node) {
        log.error("Cannot find node with id", id, "in the graph.");
        return;
    }
    updateFn(node);
    if (onNodeSelected) {
        onNodeSelected(node);
    }
    log.debug("Updated the node", node.id);
    restart();
};

ns.isRendered = function() {
    return !!svg; //cast it to boolean
};

// update graph (called when needed)
function restart() {

    log.debug("Restarting the graph.");
    // path (link) group
    path = path.data(links);

    // update existing links
    path.classed('selected', function(d) { return d === selected_link; })
        .classed('highlighted', function(d) { return d.source.highlighted && d.target.highlighted; })
        .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
        .style('marker-end', _markerEndStyle);

    // add new links
    path.enter().append('svg:path')
        .attr('class', 'link')
        .classed('selected', function(d) { return d === selected_link; })
        .classed('highlighted', function(d) { return d.source.highlighted && d.target.highlighted })
        .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
        .style('marker-end', _markerEndStyle)
        .on('mousedown', function(d) {
            log.debug("mousedown event on a link", d);
            if(d3.event.ctrlKey || zooming) return;

            // select link
            mousedown_link = d;
            if(mousedown_link === selected_link) selected_link = null;
            else selected_link = mousedown_link;
            selected_node = null;
            restart();
        });

    // remove old links
    path.exit().remove();


    // circle (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    circle = circle.data(nodes, function(d) { return d.id; });

    // update existing nodes (reflexive & selected visual states)
    circle.selectAll('circle')
        .style('fill', _nodeFillColor)
        .style('stroke', _nodeStrokeColor)
        .classed('reflexive', function(d) { return d.reflexive; });

    // add new nodes
    var g = circle.enter().append('svg:g');

    g.append('svg:circle')
        .attr('class', 'node')
        .attr('r', radius)
        .style('fill', _nodeFillColor)
        .style('stroke', _nodeStrokeColor)
        .classed('reflexive', function(d) { return d.reflexive; })
        .on('mouseover', function(d) {
            if(!mousedown_node || d === mousedown_node) return;
            // enlarge target node
            d3.select(this).attr('transform', 'scale(1.1)');
        })
        .on('mouseout', function(d) {
            if(!mousedown_node || d === mousedown_node) return;
            // unenlarge target node
            d3.select(this).attr('transform', '');
        })
        .on('mousedown', function(d) {
            log.debug("mousedown event on a node", d);
            if(d3.event.ctrlKey || zooming) return;

            // select node
            mousedown_node = d;
            if(mousedown_node === selected_node) selected_node = null;
            else selected_node = mousedown_node;
            onNodeSelected(selected_node);
            selected_link = null;

            // reposition drag line
            drag_line
                .style('marker-end', 'url(#end-arrow)')
                .classed('hidden', false)
                .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

            restart();
        })
        .on('mouseup', function(d) {
            if(!mousedown_node || !editable) return;

            // needed by FF
            drag_line
                .classed('hidden', true)
                .style('marker-end', '');

            // check for drag-to-self
            mouseup_node = d;
            if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

            // unenlarge target node
            d3.select(this).attr('transform', '');

            // add link to graph (update if exists)
            // NB: links are strictly source < target; arrows separately specified by booleans
            var source, target, direction;
            if(mousedown_node.id < mouseup_node.id) {
                source = mousedown_node;
                target = mouseup_node;
                direction = 'right';
            } else {
                source = mouseup_node;
                target = mousedown_node;
                direction = 'left';
            }

            var link;
            link = links.filter(function(l) {
                return (l.source === source && l.target === target);
            })[0];

            if(link) {
                link[direction] = true;
            } else {
                link = {source: source, target: target, left: false, right: false};
                link[direction] = true;
                links.push(link);
            }

            // select new link
            selected_link = link;
            selected_node = null;
            restart();
        });

    //update existing nodes text
    circle.selectAll('text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('class', 'in-name')
        .text(function(d) { return d.name; })
        .call(_wrapText);

    //show nodes' text
    g.append('svg:text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('class', 'in-name')
        .text(function(d) { return d.name; })
        .call(_wrapText);

    // remove old nodes
    circle.exit().remove();

    // set the graph in motion
    force.start();
}

function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
}

function mousedown() {
    // prevent I-bar on drag
    //d3.event.preventDefault();

    // because :active only works in WebKit?
    container.classed('active', true);

    if(d3.event.ctrlKey || zooming || mousedown_node || mousedown_link || !editable) return;

    // insert new node at point
    var point = d3.mouse(this),
        node = {id: ++lastNodeId, reflexive: false, type: 'new'};
    node.x = point[0];
    node.y = point[1];
    nodes.push(node);

    restart();
}

function mousemove() {
    if(!mousedown_node || !editable || zooming) return;

    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

    restart();
}

function mouseup() {

    if(mousedown_node) {
        // hide drag line
        drag_line
            .classed('hidden', true)
            .style('marker-end', '');
    }

    // because :active only works in WebKit?
    container.classed('active', false);

    // clear mouse event vars
    resetMouseVars();
}

function spliceLinksForNode(node) {
    var toSplice = links.filter(function(l) {
        return (l.source === node || l.target === node);
    });
    toSplice.map(function(l) {
        links.splice(links.indexOf(l), 1);
    });
}

// only respond once per keydown
var lastKeyDown = -1;
var zooming = false;

function keydown() {
    d3.event.preventDefault();
    if(lastKeyDown !== -1) return;
    lastKeyDown = d3.event.keyCode;

    // ctrl
    if(d3.event.keyCode === 17) {
        circle.call(force.drag);
        container.classed('ctrl', true);
    }

    if(d3.event.shiftKey) {
        log.debug("Shift key pressed ready to zoom.");
        zooming = true;
        svg.call(zoom.on("zoom", function() {
                // the "zoom" event populates d3.event with an object that has
                // a "translate" property (a 2-element Array in the form [x, y])
                // and a numeric "scale" property
                var e = d3.event,
                // now, constrain the x and y components of the translation by the
                // dimensions of the viewport
                    padding = 250, //padding for dragging
                    tx = Math.min(padding, Math.max(e.translate[0], width - (width + padding) * e.scale)),
                    ty = Math.min(padding, Math.max(e.translate[1], height - (height + padding) * e.scale));
                // then, update the zoom behavior's internal translation, so that
                // it knows how to properly manipulate it on the next movement
                log.trace('Translate to tx', tx, 'ty', ty);
                zoom.translate([tx, ty]);
                // and finally, update the <g> element's transform attribute with the
                // correct translation and scale (in reverse order)
                container.attr("transform", [
                    "translate(" + [tx, ty] + ")",
                    "scale(" + e.scale + ")"
                ].join(" "));
            }
        ));
    }

    if(!selected_node && !selected_link) return;
    switch(d3.event.keyCode) {
        case 8: // backspace
        case 46: // delete
            if (!editable) break;
            if(selected_node) {
                nodes.splice(nodes.indexOf(selected_node), 1);
                spliceLinksForNode(selected_node);
            } else if(selected_link) {
                links.splice(links.indexOf(selected_link), 1);
            }
            selected_link = null;
            selected_node = null;
            restart();
            break;
        case 66: // B
            if(editable && selected_link) {
                // set link direction to both left and right
                selected_link.left = true;
                selected_link.right = true;
            }
            restart();
            break;
        case 76: // L
            if(editable && selected_link) {
                // set link direction to left only
                selected_link.left = true;
                selected_link.right = false;
            }
            restart();
            break;
        case 82: // R
            if (!editable) break;
            if(selected_node) {
                // toggle node reflexivity
                selected_node.reflexive = !selected_node.reflexive;
            } else if(selected_link) {
                // set link direction to right only
                selected_link.left = false;
                selected_link.right = true;
            }
            restart();
            break;
    }
}

function keyup() {
    lastKeyDown = -1;

    if(zooming) {
        log.debug("Zoom event finished...");
        svg.call(zoom.on("zoom", function(d){}));
        zooming = false;
    }

    // ctrl
    if(d3.event.keyCode === 17) {
        circle
            .on('mousedown.drag', null)
            .on('touchstart.drag', null);
        container.classed('ctrl', false);
    }
}

function _wrapText(text) {
    text.each(function() {
        var d = d3.select(this);
        var split = d.text().split(/-|_|\s/, 3);
        var color = (d) => {
            if (invertedColors && (d === selected_node || d.highlighted)) {
                return 'white';
            }
            return invertedColors ? colors[d.type] : 'white';
        };
        var n = split.length;
        var y = 5 * n;
        var tspan = d.text(null).append("tspan").attr("x", 0).attr("y", y).style('fill', color);
        for (var i = split.length - 1; i >= 0; i--) {
            var line = split[i];
            tspan.text(line);
            y -= 12;
            tspan = d.append("tspan").attr("x", 0).attr("y", y).style('fill', color);
        }
    });
}

function _markerEndStyle(link) {
    if (!link.right) {
        return '';
    }
    if (link.source.highlighted && link.target.highlighted) {
        return 'url(#end-arrow-highlighted)';
    }
    return 'url(#end-arrow)';
}

function _nodeFillColor(node) {
    if (node === selected_node || node.highlighted) {
        if (invertedColors) {
            return colors[node.type];
        }
        var color = colors[node.type];
        var rgb = d3.rgb(color);
        if (new Color(color).light()) {
            return rgb.brighter(0.8);
        }
        return rgb.brighter(1.7);
    }
    if (invertedColors) {
        return 'white';
    }
    return colors[node.type];
}

function _nodeStrokeColor(node) {
    if (invertedColors) {
        return d3.rgb(colors[node.type]).toString();
    }
    return d3.rgb(colors[node.type]).darker().toString();
}

module.exports = ns;