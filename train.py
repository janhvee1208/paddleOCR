import os
import sys
import paddle

# Add local folders to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

# CPU Settings
os.environ['FLAGS_use_onednn'] = '0'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
paddle.set_device('cpu')

from tools.program import ArgsParser, load_config
from ppocr.utils.logging import get_logger
from tools.train import main

if __name__ == '__main__':
    parser = ArgsParser()
    args = parser.parse_args(['-c', 'custom_finetune.yml'])
    config = load_config(args.config)
    
    if 'Global' not in config: config['Global'] = {}
    config['Global']['profiler_options'] = None
    
    config['profiler_options'] = None
   
    device = paddle.get_device()
    logger = get_logger()
    vdl_writer = None
    seed = config['Global'].get('seed', 42)

    print(f"--- PaddleOCR Training Started on {device.upper()} ---")
    
    # Run the main training loop
    main(config, device, logger, vdl_writer, seed)