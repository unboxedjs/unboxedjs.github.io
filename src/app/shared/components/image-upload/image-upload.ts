import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';

const MAX_FILE_SIZE = 500 * 1024; // 500KB for base64 storage
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

@Component({
  selector: 'app-image-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <label [for]="inputId()" class="block text-sm font-medium text-gray-700">
        {{ label() }}
      </label>

      <!-- Preview -->
      @if (previewUrl()) {
        <div class="relative inline-block">
          <img
            [src]="previewUrl()"
            [alt]="label()"
            class="max-w-xs max-h-48 rounded-lg object-cover"
          />
          <button
            type="button"
            class="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            (click)="removeImage()"
            aria-label="Remove image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }

      <!-- Upload area -->
      <div
        class="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
        [class]="dragging() ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input
          #fileInput
          [id]="inputId()"
          type="file"
          [accept]="ALLOWED_TYPES.join(',')"
          class="hidden"
          (change)="onFileSelect($event)"
        />

        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        <p class="mt-2 text-sm text-gray-600">
          <button
            type="button"
            class="text-blue-600 hover:text-blue-500 font-medium"
            (click)="fileInput.click()"
          >
            Upload a file
          </button>
          or drag and drop
        </p>
        <p class="mt-1 text-xs text-gray-500">
          PNG, JPG, GIF, WebP up to 500KB
        </p>
      </div>

      @if (error()) {
        <p class="text-red-600 text-sm" role="alert">{{ error() }}</p>
      }

      @if (loading()) {
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Processing image...
        </div>
      }
    </div>
  `,
})
export class ImageUploadComponent {
  readonly label = input('Image');
  readonly inputId = input('image-upload');
  readonly currentImage = input<string | null>(null);
  readonly imageChange = output<string>();
  readonly imageRemove = output<void>();

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly previewUrl = signal<string | null>(null);
  protected readonly dragging = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly ALLOWED_TYPES = ALLOWED_TYPES;

  ngOnInit(): void {
    if (this.currentImage()) {
      this.previewUrl.set(this.currentImage());
    }
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  protected onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(file);
    }
  }

  protected removeImage(): void {
    this.previewUrl.set(null);
    this.imageRemove.emit();
    const input = this.fileInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  private async processFile(file: File): Promise<void> {
    this.error.set(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.error.set('Invalid file type. Please upload a PNG, JPG, GIF, or WebP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.error.set('File too large. Maximum size is 500KB.');
      return;
    }

    this.loading.set(true);

    try {
      const base64 = await this.fileToBase64(file);
      this.previewUrl.set(base64);
      this.imageChange.emit(base64);
    } catch {
      this.error.set('Failed to process image. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
