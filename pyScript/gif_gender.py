import imageio

def create_gif(image_list, gif_name):
    frames = []
    for image_name in image_list:
        frames.append(imageio.imread(image_name))
    # Save them as frames into a gif
    imageio.mimsave(gif_name, frames, 'GIF', duration = 0.1)

    return

def main():
    image_list = ['1.jpg', '2.jpg', '3.jpg',
                  '4.jpg', '5.jpg']
    gif_name = 'created_gif.gif'
    create_gif(image_list, gif_name)
if __name__ == "__main__":
    main()