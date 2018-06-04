import imageio
import sys

img = sys.argv[1: 12]
gifname = sys.argv[13]
def create_gif(image_list, gif_name):
    frames = []
    for image_name in image_list:
        frames.append(imageio.imread(image_name))
    # Save them as frames into a gif
    imageio.mimsave(gif_name, frames, 'GIF', duration = 0.2)
    return

create_gif(img, gifname)