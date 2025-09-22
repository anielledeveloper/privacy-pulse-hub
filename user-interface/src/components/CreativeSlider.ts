export class CreativeSlider {
  private element!: HTMLElement;
  private input!: HTMLInputElement;
  private valueDisplay!: HTMLElement;
  private progressHeader!: HTMLElement;
  public readonly guidelineId: string;
  private onValueChange: (value: number) => void;

  constructor(
    container: HTMLElement,
    guideline: { id: string; text: string },
    initialValue: number = 0,
    onValueChange: (value: number) => void
  ) {
    this.guidelineId = guideline.id;
    this.onValueChange = onValueChange;
    this.createSlider(container, guideline, initialValue);
  }

  private createSlider(
    container: HTMLElement,
    guideline: { id: string; text: string },
    initialValue: number
  ) {
    // Create slider container
    this.element = document.createElement('div');
    this.element.className = 'creative-slider';
    this.element.setAttribute('role', 'group');
    this.element.setAttribute('aria-labelledby', `guideline-${guideline.id}`);

    // Create guideline text
    const guidelineText = document.createElement('div');
    guidelineText.className = 'guideline-text';
    guidelineText.id = `guideline-${guideline.id}`;
    guidelineText.textContent = guideline.text;

    // Create slider input
    this.input = document.createElement('input');
    this.input.type = 'range';
    this.input.min = '0';
    this.input.max = '100';
    this.input.value = initialValue.toString();
    this.input.className = 'slider-input';
    this.input.setAttribute('aria-label', `Guideline ${guideline.id}: ${guideline.text}`);
    this.input.setAttribute('aria-valuemin', '0');
    this.input.setAttribute('aria-valuemax', '100');
    this.input.setAttribute('aria-valuenow', initialValue.toString());

    // Create value display
    this.valueDisplay = document.createElement('div');
    this.valueDisplay.className = 'value-display';
    this.valueDisplay.setAttribute('aria-live', 'polite');

    // Create progress header
    this.progressHeader = document.createElement('div');
    this.progressHeader.className = 'progress-header';

    // Create tick labels
    const tickLabels = document.createElement('div');
    tickLabels.className = 'tick-labels';
    tickLabels.innerHTML = '<span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>';

    // Assemble slider
    this.element.appendChild(guidelineText);
    this.element.appendChild(this.input);
    this.element.appendChild(this.valueDisplay);
    this.element.appendChild(this.progressHeader);
    this.element.appendChild(tickLabels);

    // Add event listeners
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('keydown', this.handleKeydown.bind(this));

    // Set initial state
    this.updateDisplay(initialValue);
    this.updateProgressHeader();

    container.appendChild(this.element);
  }

  private handleInput(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    this.updateDisplay(value);
    this.updateProgressHeader();
    this.onValueChange(value);
  }

  private handleKeydown(event: KeyboardEvent) {
    let newValue = parseInt(this.input.value);
    const step = event.shiftKey ? 10 : 1;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        newValue = Math.min(100, newValue + step);
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        newValue = Math.max(0, newValue - step);
        break;
      case 'Home':
        newValue = 0;
        break;
      case 'End':
        newValue = 100;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.input.value = newValue.toString();
    this.updateDisplay(newValue);
    this.updateProgressHeader();
    this.onValueChange(newValue);
  }

  private updateDisplay(value: number) {
    // Update ARIA attributes
    this.input.setAttribute('aria-valuenow', value.toString());
    
    // Update value display with descriptor
    const descriptor = this.getValueDescriptor(value);
    const emoji = this.getValueEmoji(value);
    this.valueDisplay.innerHTML = `
      <span class="percentage">${value}%</span>
      <span class="descriptor">— ${descriptor}</span>
      <span class="emoji" aria-hidden="true">${emoji}</span>
    `;

    // Update CSS custom property for gradient
    this.element.style.setProperty('--pct', `${value}%`);

    // Update ARIA live region
    this.valueDisplay.setAttribute('aria-label', 
      `Guideline ${this.guidelineId}: ${value} percent (${descriptor})`
    );
  }

  private updateProgressHeader() {
    // This would be updated by the parent component to show overall progress
    // For now, just show the current value
    const value = parseInt(this.input.value);
    this.progressHeader.textContent = `${value}%`;
  }

  private getValueDescriptor(value: number): string {
    if (value <= 20) return 'Rarely';
    if (value <= 40) return 'Sometimes';
    if (value <= 60) return 'Half the time';
    if (value <= 80) return 'Often';
    return 'Always';
  }

  private getValueEmoji(value: number): string {
    if (value <= 20) return '😕';
    if (value <= 40) return '😐';
    if (value <= 60) return '🙂';
    if (value <= 80) return '😊';
    return '😄';
  }

  public getValue(): number {
    return parseInt(this.input.value);
  }

  public setValue(value: number) {
    this.input.value = value.toString();
    this.updateDisplay(value);
    this.updateProgressHeader();
  }

  public disable() {
    this.input.disabled = true;
    this.element.classList.add('disabled');
  }

  public enable() {
    this.input.disabled = false;
    this.element.classList.remove('disabled');
  }
}
