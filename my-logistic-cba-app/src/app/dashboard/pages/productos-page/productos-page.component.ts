import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { ProductResponse, ProductCreationRequest } from '../../../models/product.model';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos-page.component.html',
  styleUrls: ['./productos-page.component.css']
})
export class ProductosPageComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  productos: ProductResponse[] = [];
  isLoading = false;
  errorMessage = '';

  // Modal create/edit product
  showProductModal = false;
  isCreating = false;
  isEditMode = false;
  modalError = '';
  editingProductId: string | null = null; // Store ID separately for editing

  // Modal delete product
  showDeleteModal = false;
  isDeleting = false;
  productToDelete: ProductResponse | null = null;

  newProduct: ProductCreationRequest = {
    name: '',
    description: '',
    sku: '',
    price: 0
  };

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getAll().subscribe({
      next: (products) => {
        this.productos = products;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cargar productos';
        this.isLoading = false;
        this.toastService.error(this.errorMessage);
      }
    });
  }

  // Modal methods
  openCreateProductModal(): void {
    this.isEditMode = false;
    this.showProductModal = true;
    this.resetForm();
  }

  openEditProductModal(product: ProductResponse): void {
    this.isEditMode = true;
    this.showProductModal = true;
    this.editingProductId = product.id; // Store ID separately
    this.newProduct = {
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      price: product.price
    };
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      sku: '',
      price: 0
    };
    this.editingProductId = null;
    this.modalError = '';
  }

  isFormValid(): boolean {
    return !!(
      this.newProduct.name &&
      this.newProduct.price > 0
    );
  }

  saveProduct(): void {
    if (!this.isFormValid()) {
      this.toastService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    this.isCreating = true;
    this.modalError = '';

    if (this.isEditMode && this.editingProductId) {
      // Update product
      this.productService.updateProduct(this.editingProductId, this.newProduct).subscribe({
        next: (product) => {
          this.isCreating = false;
          this.toastService.success(`Producto "${product.name}" actualizado exitosamente`);
          this.loadProducts();
          this.closeProductModal();
        },
        error: (error) => {
          this.isCreating = false;
          this.toastService.error(error.message || 'Error al actualizar el producto');
        }
      });
    } else {
      // Create product
      this.productService.createProduct(this.newProduct).subscribe({
        next: (product) => {
          this.isCreating = false;
          this.toastService.success(`Producto "${product.name}" creado exitosamente`);
          this.loadProducts();
          this.closeProductModal();
        },
        error: (error) => {
          this.isCreating = false;
          this.toastService.error(error.message || 'Error al crear el producto');
        }
      });
    }
  }

  // Delete product methods
  openDeleteModal(product: ProductResponse): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.isDeleting = true;

    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.toastService.success(
          `Producto "${this.productToDelete!.name}" eliminado exitosamente`
        );
        this.loadProducts();
        this.closeDeleteModal();
      },
      error: (error) => {
        this.isDeleting = false;
        this.toastService.error(error.message || 'Error al eliminar el producto');
        console.error('Error deleting product:', error);
      }
    });
  }
}
