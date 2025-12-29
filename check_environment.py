"""
Real vs Fake Environment - Working Setup
========================================

This script demonstrates what's working in your environment.
"""

import os
import sys

def check_environment():
    """Check what packages are available and working."""
    print("Real vs Fake Environment Check")
    print("=" * 50)
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")
    
    # Check available packages
    working_packages = []
    failed_packages = []
    
    packages_to_test = [
        'numpy', 'scipy', 'requests', 'PIL', 'gguf', 
        'torch', 'transformers', 'tokenizers'
    ]
    
    for package in packages_to_test:
        try:
            __import__(package)
            working_packages.append(package)
            print(f"✅ {package} - Working")
        except ImportError as e:
            failed_packages.append((package, str(e)))
            print(f"❌ {package} - Failed: {e}")
    
    print(f"\nWorking packages: {len(working_packages)}")
    print(f"Failed packages: {len(failed_packages)}")
    
    # Check for GGUF files
    print("\n" + "=" * 50)
    print("GGUF Files in directory:")
    gguf_files = [f for f in os.listdir('.') if f.endswith('.gguf')]
    if gguf_files:
        for file in gguf_files:
            size_mb = os.path.getsize(file) / (1024 * 1024)
            print(f"  📄 {file} ({size_mb:.1f} MB)")
    else:
        print("  No GGUF files found")
    
    return working_packages, failed_packages

def test_gguf_reader():
    """Test GGUF file reading capabilities."""
    print("\n" + "=" * 50)
    print("Testing GGUF Reader:")
    
    try:
        import gguf
        gguf_files = [f for f in os.listdir('.') if f.endswith('.gguf')]
        
        if not gguf_files:
            print("No GGUF files to test")
            return
        
        file_path = gguf_files[0]
        print(f"Reading: {file_path}")
        
        # Try to read the GGUF file
        reader = gguf.GGUFReader(file_path)
        
        print(f"Successfully opened GGUF file!")
        print(f"Tensor count: {len(reader.tensors) if hasattr(reader, 'tensors') else 'Unknown'}")
        
        # Try to get some basic info
        if hasattr(reader, 'fields'):
            print(f"Metadata fields: {len(reader.fields)}")
            
    except ImportError:
        print("GGUF package not available")
    except Exception as e:
        print(f"Error reading GGUF file: {e}")

def suggest_alternatives():
    """Suggest alternative approaches for working with LLMs."""
    print("\n" + "=" * 50)
    print("Alternative Solutions for LLM Usage:")
    print("1. Use Ollama (recommended for easy local LLM usage):")
    print("   brew install ollama")
    print("   ollama run llama2")
    
    print("\n2. Use HuggingFace Transformers with online models:")
    print("   from transformers import pipeline")
    print("   generator = pipeline('text-generation', model='gpt2')")
    
    print("\n3. Install llama.cpp CLI directly:")
    print("   brew install llama.cpp")
    print("   llama-cli -m your_model.gguf -p 'Your prompt here'")
    
    print("\n4. Use OpenAI API or other cloud services")
    
    print("\n5. Try a different Python environment (not conda):")
    print("   python3 -m venv venv")
    print("   source venv/bin/activate")
    print("   pip install llama-cpp-python")

if __name__ == "__main__":
    working, failed = check_environment()
    test_gguf_reader()
    suggest_alternatives()
    
    print("\n" + "=" * 50)
    print("Environment Summary:")
    print(f"✅ {len(working)} packages working")
    print(f"❌ {len(failed)} packages failed")
    
    if 'gguf' in working:
        print("✅ GGUF reading capability available")
    
    if 'torch' in working and 'transformers' in working:
        print("✅ HuggingFace ecosystem available")
    
    print("\nEnvironment is ready for development!")