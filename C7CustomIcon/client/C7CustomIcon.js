class C7CustomIcon {
  DEFAULT_TASK_SVG = 'data:image/svg+xml, <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M6.494 2.667C2.916 2.667 0 5.57 0 9.142v13.383C0 26.097 2.916 29 6.494 29h19.012C29.084 29 32 26.097 32 22.525V9.142c0-3.572-2.916-6.475-6.494-6.475H6.494zm0 2h19.012c2.509 0 4.494 1.98 4.494 4.475v13.383C30 25.02 28.015 27 25.506 27H6.494C3.985 27 2 25.02 2 22.525V9.142c0-2.495 1.985-4.475 4.494-4.475z"></path></svg>'
  constructor(eventBus, elementRegistry, graphicsFactory, elementTemplates) {
    this.eventBus = eventBus;
    this.elementRegistry = elementRegistry;
    this.graphicsFactory = graphicsFactory;
    this.elementTemplates = elementTemplates;

    // Event-Listener to check for changes in elements
    this.eventBus.on('element.changed', (event) => {
      const element = event.element;
      if (element.type === 'bpmn:Task') {
        this.changeIcon(element);
      }
    });

    // Event-Listener to check for selected elements
    this.eventBus.on('element.click', (event) => {
      const element = event.element;
      this.removeCustomPropertiesPanelIcon();

      if (element.type === 'bpmn:Task') {
        const svgData = this.getTemplateIconFromElement(element);
        if (svgData) {
          this.createNewPropertiesPanelIcon(svgData);
        }
     }
    });
  }

  getTemplateIconFromElement(element) {
    const businessObject = element.businessObject;
    const templateId = businessObject.modelerTemplate;
    const template = templateId ? this.elementTemplates.get(templateId) : null;
    if (template && template.icon && template.icon.contents) {
        return template.icon.contents;
    }
    return null;
  }

  changeIcon(element) {
    const gfx = this.elementRegistry.getGraphics(element.id);

    const svgData = this.getTemplateIconFromElement(element);
    if (svgData) {
      this.addCustomIcon(element, svgData);
    } else {
      // Check if Icon already exists
      let existingIcon = gfx.querySelector('.c7customicon');
      if (existingIcon) {
        gfx.removeChild(existingIcon); // Remove old Icon
        this.removeCustomPropertiesPanelIcon();
        this.createNewPropertiesPanelIcon(this.DEFAULT_TASK_SVG)
      }
    }
  }

  addCustomIcon(element, svgData) {
    // Get Graphics of Element
    const gfx = this.elementRegistry.getGraphics(element.id);
    // Create a new <svg>-Element for the icon
    const svgDom = this.parseSvgDataUri(svgData);
    svgDom.setAttribute('class', 'c7customicon'); // Class to identify
    // Prevent that Icon blocks interactions
    svgDom.setAttributeNS(null, 'pointer-events', 'none');
    // Add icon to graphical element
    gfx.appendChild(svgDom);
    // Replace icon in properties panel
    this.createNewPropertiesPanelIcon(svgData);
  }

  createNewPropertiesPanelIcon(svgData) {
    const header = document.querySelector('div.bio-properties-panel-header > div.bio-properties-panel-header-icon svg');
    if (header) {
      const propertiesPanelHeaderSvgDomElement = this.parseSvgDataUri(svgData);
      propertiesPanelHeaderSvgDomElement.setAttribute('class', 'c7customicon'); // Class to identify
      propertiesPanelHeaderSvgDomElement.setAttributeNS(null, 'pointer-events', 'none');
      header.replaceWith(propertiesPanelHeaderSvgDomElement);
    }
  }

  removeCustomPropertiesPanelIcon() {
    const header = document.querySelector('div.bio-properties-panel-header > div.bio-properties-panel-header-icon > svg.c7customicon');
    if (header) {
      header.remove();
    }
  }

  parseSvgDataUri(dataUri) {
    const parser = new DOMParser();
    const svgString = dataUri.replace('data:image/svg+xml,', '');
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    return doc.documentElement;
  }
}

// Injection-Dependencies for bpmn-js
C7CustomIcon.$inject = [
  'eventBus',
  'elementRegistry',
  'graphicsFactory',
  'elementTemplates'
];

// export Plugin
export default {
  __init__: ['C7CustomIcon'],
  C7CustomIcon: ['type', C7CustomIcon]
};